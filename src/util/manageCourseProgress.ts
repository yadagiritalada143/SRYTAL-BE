import CourseModuleModel from '../model/coursemoduleModel';
import CourseTaskModel from '../model/courseTaskModel';
import TaskProgressModel from '../model/taskProgressModel';
import { COURSE_ASSIGNMENT_STATUS } from '../types/courseAssignmentStatusValues';
import { IMyCourseModule, IMyCourseProgress, IMyCourseTask } from '../interfaces/myCourses';

/**
 * Shared progress helpers for the employee-facing course endpoints. The course
 * tree (course -> modules -> tasks) and the per-employee completion records
 * (task-progress) live in separate collections, so both are fetched flat and
 * stitched together in JS — the same approach getEmployeeDashboardService uses.
 */

/** Only published content is ever shown to an employee. */
const ACTIVE_STATUS = 'ACTIVE';

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

const toMyCourseTask = (task: any, completedTasks: Map<string, Date | null>): IMyCourseTask => {
    const isCompleted = completedTasks.has(String(task._id));

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
        isCompleted,
        completedAt: isCompleted ? completedTasks.get(String(task._id)) : null
    };
};

/**
 * Builds the module -> task tree for one course together with the employee's
 * completion state. Pass `withTasks: false` when only the counts are needed
 * (the list endpoint), to keep the payload small.
 */
export const buildCourseModules = (
    modules: any[],
    tasksByModule: Map<string, any[]>,
    completedTasks: Map<string, Date | null>
): IMyCourseModule[] =>
    modules.map((module: any) => {
        const tasks = (tasksByModule.get(String(module._id)) || []).map(task =>
            toMyCourseTask(task, completedTasks)
        );

        return {
            _id: String(module._id),
            moduleName: module.moduleName,
            moduleDescription: module.moduleDescription,
            status: module.status,
            tasks,
            totalTasks: tasks.length,
            completedTasks: tasks.filter(task => task.isCompleted).length
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
    buildCourseModules,
    summariseProgress,
    deriveAssignmentStatus,
    percentOf
};
