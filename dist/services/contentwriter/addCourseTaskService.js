"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const addCourseTask = async (moduleId, taskName, taskDescription, thumbnail, status, type, content, contentMimeType, contentFileName) => {
    try {
        let thumbnailPath = '';
        const CoursesTaskToSave = new courseTaskModel_1.default({
            moduleId,
            taskName,
            taskDescription,
            thumbnail,
            status,
            type,
            content,
            contentMimeType,
            contentFileName,
        });
        const result = await CoursesTaskToSave.save();
        // Propagate activity up: touch the parent course's updatedAt.
        const module = await coursemoduleModel_1.default.findById(moduleId).lean();
        if (module === null || module === void 0 ? void 0 : module.courseId) {
            await coursesModel_1.default.findByIdAndUpdate(module.courseId, { $currentDate: { updatedAt: true } });
        }
        return result;
    }
    catch (error) {
        console.error('Error in adding course task:', error);
        return { success: false };
    }
};
exports.default = { addCourseTask };
