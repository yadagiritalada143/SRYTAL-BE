"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const updateCourseTask = async (id, taskName, taskDescription, thumbnail, status) => {
    try {
        const result = await courseTaskModel_1.default.updateMany({ _id: id }, { taskName, taskDescription, thumbnail, status });
        if (!result) {
            return { success: false };
        }
        return { success: true, responseAfterUpdate: result };
    }
    catch (error) {
        console.error(`Error in updating course task: ${error}`);
        return { success: false, responseAfterUpdate: error };
    }
};
exports.default = { updateCourseTask };
