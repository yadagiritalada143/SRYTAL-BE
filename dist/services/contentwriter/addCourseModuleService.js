"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const stripHtmlTags_1 = require("../../util/stripHtmlTags");
const addNewCourseModule = async (courseId, moduleName, moduleDescription, thumbnail, status, orderIdx) => {
    try {
        const existingModule = await coursemoduleModel_1.default.findOne({
            courseId,
            orderIdx
        });
        if (existingModule) {
            return {
                success: false,
                message: 'DUPLICATE_ORDER_IDX'
            };
        }
        const courseModuleToSave = new coursemoduleModel_1.default({
            courseId,
            moduleName,
            moduleDescription: (0, stripHtmlTags_1.stripHtmlTags)(moduleDescription),
            thumbnail,
            status,
            orderIdx
        });
        const result = await courseModuleToSave.save();
        await coursesModel_1.default.findByIdAndUpdate(courseId, { $currentDate: { updatedAt: true } });
        return {
            success: true,
            data: result
        };
    }
    catch (error) {
        console.error('Error in adding Module:', error);
        return { success: false };
    }
};
exports.default = { addNewCourseModule };
