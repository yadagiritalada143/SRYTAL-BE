"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const addCourseService = async (courseName, courseDescription, thumbnail, status) => {
    try {
        const CourseToSave = new coursesModel_1.default({ courseName, courseDescription, thumbnail, status, });
        const result = await CourseToSave.save();
        return result;
    }
    catch (error) {
        console.error('Error in adding new course:', error);
        return { success: false };
    }
};
exports.default = { addCourseService };
