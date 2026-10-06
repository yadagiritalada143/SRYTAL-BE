import CourseModuleModel from '../model/coursemoduleModel';
import CourseTaskModel from '../model/courseTaskModel';
import TaskProgressModel from '../model/taskProgressModel';
import CodeRunModel from '../model/codeRunModel';
import { COURSE_ASSIGNMENT_STATUS } from '../types/courseAssignmentStatusValues';
import { resolveQuestions, isQuestionActive } from './courseTaskQuestions';
import { IMyCourseModule, IMyCourseProgress, IMyCourseTask } from '../interfaces/myCourses';

/**
 * Shared progress helpers for the employee-facing course endpoints. The course
 * tree (course -> modules -> tasks) and the per-employee completion records
 * (task-progress) live in separate collections, so both are fetched flat and
 * stitched together in JS — the same approach getEmployeeDashboardService uses.
 */

/** Only published content is ever shown to an employee. */
const ACTIVE_STATUS = 'ACTIVE';

/** A question is solved only by a final submission that passed every test case. */
const SOLVED_SUBMISSION_TYPE = 'submit';
const SOLVED_SUBMISSION_STATUS = 'ALL_PASSED';

const isActive = (status?: string) => (status || ACTIVE_STATUS).toUpperCase() === ACTIVE_STATUS;


export const percentOf = (completedTasks: number, totalTasks: number): number =>
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

/**
 * The assignment status is derived from completion rather than set by hand, so
 * it can never drift from the task-progress rows.
 */
export const deriveAssignmentStatus = (completedTasks: number, totalTasks: number): string => {
    if (totalTasks > 0 && completedTasks >= totalTasks) {
        return COURSE_ASSIGNMENT_STATUS.COMPLETED;
    }
    if (completedTasks > 0) {
        return COURSE_ASSIGNMENT_STATUS.IN_PROGRESS;
    }
    return COURSE_ASSIGNMENT_STATUS.ASSIGNED;
};

/** Active modules of the given courses, keyed by course id. */
const getActiveModulesByCourse = async (courseIds: string[]) => {
    const modules = await CourseModuleModel.find({ courseId: { $in: courseIds } })
        .sort({ createdAt: 1 })
        .lean();

    const modulesByCourse = new Map<string, any[]>();
    modules.filter((module: any) => isActive(module.status)).forEach((module: any) => {
        const key = String(module.courseId);
        modulesByCourse.set(key, [...(modulesByCourse.get(key) || []), module]);
    });

    return modulesByCourse;
};

/** Active tasks of the given modules, keyed by module id. */
const getActiveTasksByModule = async (moduleIds: string[]) => {
    const tasks = await CourseTaskModel.find({ moduleId: { $in: moduleIds } })
        .sort({ createdAt: 1 })
        .lean();

    const tasksByModule = new Map<string, any[]>();
    tasks.filter((task: any) => isActive(task.status)).forEach((task: any) => {
        const key = String(task.moduleId);
        tasksByModule.set(key, [...(tasksByModule.get(key) || []), task]);
    });

    return tasksByModule;
};

/**
 * Completed task ids per course assignment. Only `isCompleted` rows are kept —
 * a row that exists but is false counts the same as no row at all.
 */
const getCompletedTaskIds = async (courseAssignmentIds: string[]) => {
    const progressRows = await TaskProgressModel.find({
        courseAssignmentId: { $in: courseAssignmentIds },
        isCompleted: true
    }).lean();

    const completedByAssignment = new Map<string, Map<string, Date | null>>();
    progressRows.forEach((row: any) => {
        const key = String(row.courseAssignmentId);
        const taskMap = completedByAssignment.get(key) || new Map<string, Date | null>();
        taskMap.set(String(row.taskId), row.completedAt || null);
        completedByAssignment.set(key, taskMap);
    });

    return completedByAssignment;
};

/**
 * Per assignment, how many of each task's questions the employee has already
 * passed. Used only to render "3 of 5 answered" next to a coding task - the
 * completion decision itself lives in syncTaskCompletion, which re-reads the
 * submission rows at the moment a submission lands.
 */
export const getCompletedQuestionCounts = async (
    courseAssignmentIds: string[],
    employeeIdByAssignment: Map<string, string>
): Promise<Map<string, Map<string, number>>> => {
    const employeeIds = Array.from(new Set(Array.from(employeeIdByAssignment.values()).filter(Boolean)));

    if (employeeIds.length === 0) {
        return new Map();
    }

    const solvedSubmissions: any[] = await CodeRunModel.find({
        userId: { $in: employeeIds },
        type: SOLVED_SUBMISSION_TYPE,
        status: SOLVED_SUBMISSION_STATUS
    })
        .select('userId taskId questionId')
        .lean();

    const assignmentByEmployee = new Map<string, string>();
    employeeIdByAssignment.forEach((employeeId, courseAssignmentId) => {
        assignmentByEmployee.set(String(employeeId), String(courseAssignmentId));
    });

    const counts = new Map<string, Map<string, number>>();
    const seen = new Set<string>();

    for (const submission of solvedSubmissions || []) {
        const courseAssignmentId = assignmentByEmployee.get(String(submission?.userId));
        if (!courseAssignmentId) {
            continue;
        }

        // A question is counted once no matter how many times it was submitted.
        const pair = `${String(submission?.taskId)}::${String(submission?.questionId)}`;
        if (seen.has(pair)) {
            continue;
        }
        seen.add(pair);

        const taskId = String(submission?.taskId);
        const byTask = counts.get(courseAssignmentId) || new Map<string, number>();
        byTask.set(taskId, (byTask.get(taskId) || 0) + 1);
        counts.set(courseAssignmentId, byTask);
    }

    return counts;
};

const toMyCourseTask = (
    task: any,
    completedTasks: Map<string, Date | null>,
    completedQuestions?: Map<string, number>
): IMyCourseTask => {
    const isCompleted = completedTasks.has(String(task._id));
    const isCoding = Boolean(task.isCoding);
    const questions = resolveQuestions(task);
    const activeQuestionCount = questions.filter(isQuestionActive).length;

    return {
        _id: String(task._id),
        taskName: task.taskName,
        taskDescription: task.taskDescription,
        status: task.status,
        type: task.type,
        // 'FILE' content is an S3 key, which is useless (and private) to the
        // client — those tasks are streamed through the content proxy instead.
        link: task.type === 'LINK' ? task.content : undefined,
        contentMimeType: task.contentMimeType,
        contentFileName: task.contentFileName,
        isCoding,
        questionCount: activeQuestionCount,
        // Capped at the active count so an archived-then-solved question cannot
        // make a task look more than fully answered.
        completedQuestionCount: isCoding
            ? Math.min(activeQuestionCount, completedQuestions?.get(String(task._id)) || 0)
            : undefined,
        isCompleted,
        completedAt: isCompleted ? completedTasks.get(String(task._id)) : null
    };
};

/**
 * A coding task with no published questions can never be completed, so it is
 * left out of the module's totalTasks. It is still returned in `tasks` so the
 * employee can see it; excluding it only stops it from blocking course
 * completion while a content writer is still filling it in.
 */
const isTrackable = (task: any): boolean =>
    !(task.isCoding && resolveQuestions(task).filter(isQuestionActive).length === 0);

/**
 * Builds the module -> task tree for one course together with the employee's
 * completion state. Pass `withTasks: false` when only the counts are needed
 * (the list endpoint), to keep the payload small.
 */
export const buildCourseModules = (
    modules: any[],
    tasksByModule: Map<string, any[]>,
    completedTasks: Map<string, Date | null>,
    completedQuestionsByTask?: Map<string, number>
): IMyCourseModule[] =>
    modules.map((module: any) => {
        const rawTasks = tasksByModule.get(String(module._id)) || [];
        const trackableTaskIds = new Set(
            rawTasks.filter(isTrackable).map((task: any) => String(task._id))
        );
        const tasks = rawTasks.map((task: any) =>
            toMyCourseTask(task, completedTasks, completedQuestionsByTask)
        );

        return {
            _id: String(module._id),
            moduleName: module.moduleName,
            moduleDescription: module.moduleDescription,
            status: module.status,
            tasks,
            totalTasks: trackableTaskIds.size,
            completedTasks: tasks.filter(task => task.isCompleted && trackableTaskIds.has(task._id)).length
        };
    });



export const summariseProgress = (modules: IMyCourseModule[]): IMyCourseProgress => {
    const totalTasks = modules.reduce((sum, module) => sum + module.totalTasks, 0);
    const completedTasks = modules.reduce((sum, module) => sum + module.completedTasks, 0);

    return { totalTasks, completedTasks, percentComplete: percentOf(completedTasks, totalTasks) };
};

export default {
    getActiveModulesByCourse,
    getActiveTasksByModule,
    getCompletedTaskIds,
    getCompletedQuestionCounts,
    buildCourseModules,
    summariseProgress,
    deriveAssignmentStatus,
    percentOf
};
