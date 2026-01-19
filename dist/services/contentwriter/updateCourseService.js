"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const updateCourse = async (id, courseName, courseDescription, thumbnail, status) => {
    try {
        const result = await coursesModel_1.default.updateOne({ _id: id }, { courseName, courseDescription, thumbnail, status });
        if (!result) {
            return { success: false };
        }
        return { success: true, responseAfterUpdateCourse: result };
    }
    catch (error) {
        console.error(`Error in updating Course: ${error}`);
        return { success: false, responseAfterUpdateCourse: error };
    }
};
exports.default = { updateCourse };
