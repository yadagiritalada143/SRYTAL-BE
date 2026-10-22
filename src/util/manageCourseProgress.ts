import CourseModuleModel from '../model/coursemoduleModel';
import CourseTaskModel from '../model/courseTaskModel';
import TaskProgressModel from '../model/taskProgressModel';
import { COURSE_ASSIGNMENT_STATUS } from '../types/courseAssignmentStatusValues';
import { IMyCourseModule, IMyCourseProgress, IMyCourseTask } from '../interfaces/myCourses';
import { COURSE_MODULE_CREATION_ORDER, COURSE_TASK_CREATION_ORDER } from '../constants/courseOrdering';

/** Only published content is ever shown to an employee. */
const ACTIVE_STATUS = 'ACTIVE';

const isActive = (status?: string) => (status || ACTIVE_STATUS).toUpperCase() === ACTIVE_STATUS;

export const percentOf = (completedTasks: number, totalTasks: number): number =>
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

export const deriveAssignmentStatus = (completedTasks: number, totalTasks: number): string => {
    if (totalTasks > 0 && completedTasks >= totalTasks) {
        return COURSE_ASSIGNMENT_STATUS.COMPLETED;
    }
    if (completedTasks > 0) {
        return COURSE_ASSIGNMENT_STATUS.IN_PROGRESS;
    }
    return COURSE_ASSIGNMENT_STATUS.ASSIGNED;
};
const getActiveModulesByCourse = async (courseIds: string[]) => {
    const modules = await CourseModuleModel.find({ courseId: { $in: courseIds } })
        .sort(COURSE_MODULE_CREATION_ORDER)
        .lean();

    const modulesByCourse = new Map<string, any[]>();
    modules.filter((module: any) => isActive(module.status)).forEach((module: any) => {
        const key = String(module.courseId);
        modulesByCourse.set(key, [...(modulesByCourse.get(key) || []), module]);
    });

    return modulesByCourse;
};

const getActiveTasksByModule = async (moduleIds: string[]) => {
    const tasks = await CourseTaskModel.find({ moduleId: { $in: moduleIds } })
        .sort(COURSE_TASK_CREATION_ORDER)
        .lean();

    const tasksByModule = new Map<string, any[]>();
    tasks.filter((task: any) => isActive(task.status)).forEach((task: any) => {
        const key = String(task.moduleId);
        tasksByModule.set(key, [...(tasksByModule.get(key) || []), task]);
    });

    return tasksByModule;
};

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
    const isFileTask = String(task.type || '').toUpperCase() === 'FILE';

    return {
        _id: String(task._id),
        taskName: task.taskName,
        taskDescription: task.taskDescription,
        status: task.status,
        type: task.type,
        isCoding: String(task.type || '').toUpperCase() === 'CODE',
        link: task.type === 'LINK' ? task.content : undefined,
        contentMimeType: task.contentMimeType,
        contentFileName: task.contentFileName,
        acknowledgementText: isFileTask ? task.acknowledgementText || '' : undefined,
        isCompleted,
        completedAt: isCompleted ? completedTasks.get(String(task._id)) : null
    };
};

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

export const withAcknowledgementState = (
    modules: IMyCourseModule[],
    taskAcknowledgements: any[]
): IMyCourseModule[] => {
    const acknowledgedByTask = new Map<string, Date | null>();
    (taskAcknowledgements || []).forEach((record: any) => {
        if (record && record.taskId) {
            acknowledgedByTask.set(String(record.taskId), record.acknowledgedAt || null);
        }
    });

    return modules.map((module) => {
        const tasks = (module.tasks || []).map((task) => {
            const isFileTask = String(task.type || '').toUpperCase() === 'FILE';
            if (!isFileTask) {
                return task;
            }

            const acknowledged = acknowledgedByTask.has(String(task._id));
            return {
                ...task,
                acknowledged,
                acknowledgedAt: acknowledged ? acknowledgedByTask.get(String(task._id)) || null : null
            };
        });

        return { ...module, tasks };
    });
};

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
    withAcknowledgementState,
    summariseProgress,
    deriveAssignmentStatus,
    percentOf
};
