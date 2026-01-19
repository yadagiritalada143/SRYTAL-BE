"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const addNewCourseModuleService = async (courseId, moduleName, moduleDescription, thumbnail, status) => {
    try {
        const CoursesModuleToSave = new coursemoduleModel_1.default({ courseId, moduleName, moduleDescription, thumbnail, status });
        const result = await CoursesModuleToSave.save();
        return result;
    }
    catch (error) {
        console.error('Error in adding Module:', error);
        return { success: false };
    }
};
exports.default = { addNewCourseModuleService };
