"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summariseProgress = exports.buildCourseModules = exports.deriveAssignmentStatus = exports.percentOf = void 0;
const coursemoduleModel_1 = __importDefault(require("../model/coursemoduleModel"));
const courseTaskModel_1 = __importDefault(require("../model/courseTaskModel"));
const taskProgressModel_1 = __importDefault(require("../model/taskProgressModel"));
const courseAssignmentStatusValues_1 = require("../types/courseAssignmentStatusValues");
/**
 * Shared progress helpers for the employee-facing course endpoints. The course
 * tree (course -> modules -> tasks) and the per-employee completion records
 * (task-progress) live in separate collections, so both are fetched flat and
 * stitched together in JS — the same approach getEmployeeDashboardService uses.
 */
/** Only published content is ever shown to an employee. */
const ACTIVE_STATUS = 'ACTIVE';
const isActive = (status) => (status || ACTIVE_STATUS).toUpperCase() === ACTIVE_STATUS;
const percentOf = (completedTasks, totalTasks) => totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
exports.percentOf = percentOf;
/**
 * The assignment status is derived from completion rather than set by hand, so
 * it can never drift from the task-progress rows.
 */
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
/** Active modules of the given courses, keyed by course id. */
const getActiveModulesByCourse = async (courseIds) => {
    const modules = await coursemoduleModel_1.default.find({ courseId: { $in: courseIds } })
        .sort({ createdAt: 1 })
        .lean();
    const modulesByCourse = new Map();
    modules.filter((module) => isActive(module.status)).forEach((module) => {
        const key = String(module.courseId);
        modulesByCourse.set(key, [...(modulesByCourse.get(key) || []), module]);
    });
    return modulesByCourse;
};
/** Active tasks of the given modules, keyed by module id. */
const getActiveTasksByModule = async (moduleIds) => {
    const tasks = await courseTaskModel_1.default.find({ moduleId: { $in: moduleIds } })
        .sort({ createdAt: 1 })
        .lean();
    const tasksByModule = new Map();
    tasks.filter((task) => isActive(task.status)).forEach((task) => {
        const key = String(task.moduleId);
        tasksByModule.set(key, [...(tasksByModule.get(key) || []), task]);
    });
    return tasksByModule;
};
/**
 * Completed task ids per course assignment. Only `isCompleted` rows are kept —
 * a row that exists but is false counts the same as no row at all.
 */
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
    summariseProgress: exports.summariseProgress,
    deriveAssignmentStatus: exports.deriveAssignmentStatus,
    percentOf: exports.percentOf
};
