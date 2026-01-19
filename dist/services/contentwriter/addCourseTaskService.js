"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const addCourseTaskService = async (moduleId, taskName, taskDescription, thumbnail, status) => {
    try {
        const CoursesTaskToSave = new courseTaskModel_1.default({ moduleId, taskName, taskDescription, thumbnail, status });
        const result = await CoursesTaskToSave.save();
        return result;
    }
    catch (error) {
        console.error('Error in adding course task:', error);
        return { success: false };
    }
};
exports.default = { addCourseTaskService };
