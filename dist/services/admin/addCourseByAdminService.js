"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const addCourseByAdminService = async (courseName, courseDescription) => {
    try {
        const CoursesToSave = new coursesModel_1.default({ courseName, courseDescription });
        const result = await CoursesToSave.save();
        return result;
    }
    catch (error) {
        console.error(`Error in adding Courses: ${error}`);
        return { success: false };
    }
};
exports.default = { addCourseByAdminService };
