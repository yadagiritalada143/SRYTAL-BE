"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const isValidObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value || ''));
const reorderCourseTasks = async (moduleId, tasks) => {
    try {
        if (!isValidObjectId(moduleId)) {
            return { success: false, errorCode: 'INVALID_MODULE_ID' };
        }
        if (!Array.isArray(tasks) || tasks.length === 0) {
            return { success: false, errorCode: 'INVALID_TASKS' };
        }
        const taskIds = tasks.map((task) => String((task === null || task === void 0 ? void 0 : task.taskId) || ''));
        if (taskIds.some((taskId) => !isValidObjectId(taskId))) {
            return { success: false, errorCode: 'INVALID_TASK_ID' };
        }
        if (new Set(taskIds).size !== taskIds.length) {
            return { success: false, errorCode: 'DUPLICATE_TASK_ID' };
        }
        const orderIdxs = tasks.map((task) => task === null || task === void 0 ? void 0 : task.orderIdx);
        if (orderIdxs.some((orderIdx) => !Number.isInteger(orderIdx) || orderIdx < 1)) {
            return { success: false, errorCode: 'INVALID_ORDER_IDX' };
        }
        if (new Set(orderIdxs).size !== orderIdxs.length) {
            return { success: false, errorCode: 'DUPLICATE_ORDER_IDX' };
        }
        const courseModule = await coursemoduleModel_1.default.findById(moduleId)
            .select('_id courseId')
            .lean();
        if (!courseModule) {
            return { success: false, errorCode: 'MODULE_NOT_FOUND' };
        }
        const courseTasks = await courseTaskModel_1.default.find({
            _id: { $in: taskIds }
        })
            .select('_id moduleId')
            .lean();
        if (courseTasks.length !== taskIds.length) {
            return { success: false, errorCode: 'TASK_NOT_FOUND' };
        }
        const tasksBelongToModule = courseTasks.every((courseTask) => String(courseTask.moduleId) === String(moduleId));
        if (!tasksBelongToModule) {
            return { success: false, errorCode: 'TASK_NOT_IN_MODULE' };
        }
        const conflictingTask = await courseTaskModel_1.default.findOne({
            moduleId,
            orderIdx: { $in: orderIdxs },
            _id: { $nin: taskIds }
        })
            .select('_id')
            .lean();
        if (conflictingTask) {
            return { success: false, errorCode: 'DUPLICATE_ORDER_IDX' };
        }
        await courseTaskModel_1.default.bulkWrite(tasks.map((task) => ({
            updateOne: {
                filter: { _id: task.taskId, moduleId },
                update: { $set: { orderIdx: task.orderIdx } }
            }
        })));
        if (courseModule.courseId) {
            await coursesModel_1.default.findByIdAndUpdate(courseModule.courseId, {
                $currentDate: { updatedAt: true }
            });
        }
        const updatedTasks = await courseTaskModel_1.default.find({
            _id: { $in: taskIds },
            moduleId
        })
            .select('_id orderIdx')
            .lean();
        const orderedTasks = tasks.map((task) => {
            const updatedTask = updatedTasks.find((item) => String(item._id) === String(task.taskId));
            const orderIdx = updatedTask ? Number(updatedTask.orderIdx) : Number(task.orderIdx);
            return {
                taskId: task.taskId,
                orderIdx
            };
        });
        return {
            success: true,
            data: {
                moduleId,
                tasks: orderedTasks
            }
        };
    }
    catch (error) {
        console.error(`Error in reordering course tasks: ${error}`);
        return { success: false, errorCode: 'REORDER_FAILED' };
    }
};
exports.default = { reorderCourseTasks };
