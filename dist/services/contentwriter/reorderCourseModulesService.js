"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const reorderCourseModules = async (courseId, modules) => {
    try {
        if (!courseId) {
            return { success: false, errorCode: 'INVALID_COURSE_ID' };
        }
        if (!Array.isArray(modules) || modules.length === 0) {
            return { success: false, errorCode: 'INVALID_MODULES' };
        }
        const moduleIds = modules.map((module) => String((module === null || module === void 0 ? void 0 : module.moduleId) || ''));
        if (moduleIds.some((moduleId) => !moduleId)) {
            return { success: false, errorCode: 'INVALID_MODULE_ID' };
        }
        if (new Set(moduleIds).size !== moduleIds.length) {
            return { success: false, errorCode: 'DUPLICATE_MODULE_ID' };
        }
        const orderIdxs = modules.map((module) => module === null || module === void 0 ? void 0 : module.orderIdx);
        if (orderIdxs.some((orderIdx) => !Number.isInteger(orderIdx) || orderIdx < 1)) {
            return { success: false, errorCode: 'INVALID_ORDER_IDX' };
        }
        if (new Set(orderIdxs).size !== orderIdxs.length) {
            return { success: false, errorCode: 'DUPLICATE_ORDER_IDX' };
        }
        const course = await coursesModel_1.default.findById(courseId).select('_id').lean();
        if (!course) {
            return { success: false, errorCode: 'COURSE_NOT_FOUND' };
        }
        const courseModules = await coursemoduleModel_1.default.find({
            _id: { $in: moduleIds }
        })
            .select('_id courseId')
            .lean();
        if (courseModules.length !== moduleIds.length) {
            return { success: false, errorCode: 'MODULE_NOT_FOUND' };
        }
        const modulesBelongToCourse = courseModules.every((courseModule) => String(courseModule.courseId) === String(courseId));
        if (!modulesBelongToCourse) {
            return { success: false, errorCode: 'MODULE_NOT_IN_COURSE' };
        }
        const conflictingModule = await coursemoduleModel_1.default.findOne({
            courseId,
            orderIdx: { $in: orderIdxs },
            _id: { $nin: moduleIds }
        })
            .select('_id')
            .lean();
        if (conflictingModule) {
            return { success: false, errorCode: 'DUPLICATE_ORDER_IDX' };
        }
        await coursemoduleModel_1.default.bulkWrite(modules.map((module) => ({
            updateOne: {
                filter: { _id: module.moduleId, courseId },
                update: { $set: { orderIdx: module.orderIdx } }
            }
        })));
        await coursesModel_1.default.findByIdAndUpdate(courseId, { $currentDate: { updatedAt: true } });
        const updatedModules = await coursemoduleModel_1.default.find({
            _id: { $in: moduleIds },
            courseId
        })
            .select('_id moduleId orderIdx')
            .lean();
        const reorderedModules = modules.map((module) => ({
            moduleId: module.moduleId,
            orderIdx: module.orderIdx
        }));
        return {
            success: true,
            data: {
                courseId,
                modules: reorderedModules
            }
        };
    }
    catch (error) {
        console.error(`Error in reordering course modules: ${error}`);
        return { success: false, errorCode: 'REORDER_FAILED' };
    }
};
exports.default = { reorderCourseModules };
