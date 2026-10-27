"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summariseProgress = exports.withAcknowledgementState = exports.buildCourseModules = exports.deriveAssignmentStatus = exports.percentOf = void 0;
const coursemoduleModel_1 = __importDefault(require("../model/coursemoduleModel"));
const courseTaskModel_1 = __importDefault(require("../model/courseTaskModel"));
const taskProgressModel_1 = __importDefault(require("../model/taskProgressModel"));
const courseAssignmentStatusValues_1 = require("../types/courseAssignmentStatusValues");
const courseOrdering_1 = require("../constants/courseOrdering");
/** Only published content is ever shown to an employee. */
const ACTIVE_STATUS = 'ACTIVE';
const isActive = (status) => (status || ACTIVE_STATUS).toUpperCase() === ACTIVE_STATUS;
const percentOf = (completedTasks, totalTasks) => totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
exports.percentOf = percentOf;
const deriveAssignmentStatus = (completedTasks, totalTasks) => {
    if (totalTasks > 0 && completedTasks >= totalTasks) {
        return courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED;
    }
    if (completedTasks > 0) {
        return courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.IN_PROGRESS;
    }
    return courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.ASSIGNED;
};
exports.deriveAssignmentStatus = deriveAssignmentStatus;
const getActiveModulesByCourse = async (courseIds) => {
    const modules = await coursemoduleModel_1.default.find({ courseId: { $in: courseIds } })
        .sort(courseOrdering_1.COURSE_MODULE_CREATION_ORDER)
        .lean();
    const modulesByCourse = new Map();
    modules.filter((module) => isActive(module.status)).forEach((module) => {
        const key = String(module.courseId);
        modulesByCourse.set(key, [...(modulesByCourse.get(key) || []), module]);
    });
    return modulesByCourse;
};
const getActiveTasksByModule = async (moduleIds) => {
    const tasks = await courseTaskModel_1.default.find({ moduleId: { $in: moduleIds } })
        .sort(courseOrdering_1.COURSE_TASK_CREATION_ORDER)
        .lean();
    const tasksByModule = new Map();
    tasks.filter((task) => isActive(task.status)).forEach((task) => {
        const key = String(task.moduleId);
        tasksByModule.set(key, [...(tasksByModule.get(key) || []), task]);
    });
    return tasksByModule;
};
const getCompletedTaskIds = async (courseAssignmentIds) => {
    const progressRows = await taskProgressModel_1.default.find({
        courseAssignmentId: { $in: courseAssignmentIds },
        isCompleted: true
    }).lean();
    const completedByAssignment = new Map();
    progressRows.forEach((row) => {
        const key = String(row.courseAssignmentId);
        const taskMap = completedByAssignment.get(key) || new Map();
        taskMap.set(String(row.taskId), row.completedAt || null);
        completedByAssignment.set(key, taskMap);
    });
    return completedByAssignment;
};
const toMyCourseTask = (task, completedTasks) => {
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
const buildCourseModules = (modules, tasksByModule, completedTasks) => modules.map((module) => {
    const tasks = (tasksByModule.get(String(module._id)) || []).map(task => toMyCourseTask(task, completedTasks));
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
exports.buildCourseModules = buildCourseModules;
const withAcknowledgementState = (modules, taskAcknowledgements) => {
    const acknowledgedByTask = new Map();
    (taskAcknowledgements || []).forEach((record) => {
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
            return Object.assign(Object.assign({}, task), { acknowledged, acknowledgedAt: acknowledged ? acknowledgedByTask.get(String(task._id)) || null : null });
        });
        return Object.assign(Object.assign({}, module), { tasks });
    });
};
exports.withAcknowledgementState = withAcknowledgementState;
const summariseProgress = (modules) => {
    const totalTasks = modules.reduce((sum, module) => sum + module.totalTasks, 0);
    const completedTasks = modules.reduce((sum, module) => sum + module.completedTasks, 0);
    return { totalTasks, completedTasks, percentComplete: (0, exports.percentOf)(completedTasks, totalTasks) };
};
exports.summariseProgress = summariseProgress;
exports.default = {
    getActiveModulesByCourse,
    getActiveTasksByModule,
    getCompletedTaskIds,
    buildCourseModules: exports.buildCourseModules,
    withAcknowledgementState: exports.withAcknowledgementState,
    summariseProgress: exports.summariseProgress,
    deriveAssignmentStatus: exports.deriveAssignmentStatus,
    percentOf: exports.percentOf
};
