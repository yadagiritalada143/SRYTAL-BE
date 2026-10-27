"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteQuizQuestionService_1 = __importDefault(require("../../services/contentwriter/deleteQuizQuestionService"));
const courseQuizQuestionMessages_1 = require("../../constants/contentwriter/courseQuizQuestionMessages");
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const deleteQuizQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const result = await deleteQuizQuestionService_1.default.deleteQuizQuestion(questionId);
        if (result.success) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.OK).json({
                success: true,
                message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES.COURSE_QUIZ_QUESTION_DELETE_SUCCESS_MESSAGE
            });
        }
        if (result.invalidQuestionId || result.questionNotFound || result.taskNotFound || result.notQuizTask) {
            if (result.questionNotFound) {
                return res.status(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_QUESTION_NOT_FOUND_MESSAGE
                });
            }
            if (result.taskNotFound) {
                return res.status(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_TASK_NOT_FOUND_MESSAGE
                });
            }
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_INVALID_TASK_ID_MESSAGE
            });
        }
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_DELETE_ERROR_MESSAGE
        });
    }
    catch (error) {
        console.error(`Error in deleting quiz question: ${error}`);
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_DELETE_ERROR_MESSAGE
        });
    }
};
exports.default = { deleteQuizQuestion };
