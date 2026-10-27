"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getQuizQuestionByIdService_1 = __importDefault(require("../../services/contentwriter/getQuizQuestionByIdService"));
const courseQuizQuestionMessages_1 = require("../../constants/contentwriter/courseQuizQuestionMessages");
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const getQuizQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_INVALID_TASK_ID_MESSAGE
            });
        }
        const result = await getQuizQuestionByIdService_1.default.getQuizQuestionById(id);
        if (result.success) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.OK).json({
                success: true,
                message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES.COURSE_QUIZ_QUESTION_FETCH_SINGLE_SUCCESS_MESSAGE,
                data: result.question
            });
        }
        if (result.questionNotFound) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_QUESTION_NOT_FOUND_MESSAGE
            });
        }
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_FETCH_SINGLE_ERROR_MESSAGE
        });
    }
    catch (error) {
        console.error(`Error in fetching quiz question: ${error}`);
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_FETCH_SINGLE_ERROR_MESSAGE
        });
    }
};
exports.default = { getQuizQuestionById };
