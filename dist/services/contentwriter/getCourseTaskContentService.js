"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const getCourseTaskContent = async (id) => {
    try {
        const task = await courseTaskModel_1.default.findById(id);
        if (!task) {
            return { success: false };
        }
        return { success: true, task };
    }
    catch (error) {
        console.error(`Error in fetching course task content: ${error}`);
        return { success: false };
    }
};
exports.default = { getCourseTaskContent };
