"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateQuizQuestionStatusService_1 = __importDefault(require("../../services/contentwriter/updateQuizQuestionStatusService"));
const courseQuizQuestionMessages_1 = require("../../constants/contentwriter/courseQuizQuestionMessages");
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const updateQuizQuestionStatus = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { status } = req.body || {};
        const result = await updateQuizQuestionStatusService_1.default.updateQuizQuestionStatus(questionId, status);
        if (result.success) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.OK).json({
                success: true,
                message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES.COURSE_QUIZ_QUESTION_SHOW_HIDE_SUCCESS_MESSAGE ||
                    courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES.COURSE_QUIZ_QUESTION_STATUS_UPDATE_SUCCESS_MESSAGE,
                data: result.question
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
        if (result.invalidStatus) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_VALIDATION_ERROR_MESSAGE
            });
        }
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_STATUS_UPDATE_ERROR_MESSAGE
        });
    }
    catch (error) {
        console.error(`Error in updating quiz question status: ${error}`);
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_STATUS_UPDATE_ERROR_MESSAGE
        });
    }
};
exports.default = { updateQuizQuestionStatus };
