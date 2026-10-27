"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseQuizQuestionModel_1 = __importDefault(require("../../model/courseQuizQuestionModel"));
const getQuizQuestionById = async (questionId) => {
    try {
        const question = await courseQuizQuestionModel_1.default.findOne({
            _id: questionId,
            isDeleted: false
        }).lean();
        if (!question) {
            return { success: false, questionNotFound: true };
        }
        return { success: true, question };
    }
    catch (error) {
        console.error(`Error in fetching quiz question ${questionId}: ${error}`);
        return { success: false };
    }
};
exports.default = { getQuizQuestionById };
