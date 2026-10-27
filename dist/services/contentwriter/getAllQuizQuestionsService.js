"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const courseQuizQuestionModel_1 = __importDefault(require("../../model/courseQuizQuestionModel"));
const getAllQuizQuestions = async (taskId) => {
    try {
        const task = await courseTaskModel_1.default.findById(taskId)
            .select('type')
            .lean();
        if (!task) {
            return { success: false, taskNotFound: true };
        }
        if (String(task.type || '').toUpperCase() !== 'QUIZ') {
            return { success: false, notQuizTask: true };
        }
        const questions = await courseQuizQuestionModel_1.default.find({
            taskId,
            isDeleted: false,
        })
            .sort({ createdAt: 1, _id: 1 })
            .lean();
        return { success: true, questions };
    }
    catch (error) {
        console.error(`Error in fetching quiz questions for task ${taskId}: ${error}`);
        return { success: false };
    }
};
exports.default = { getAllQuizQuestions };
