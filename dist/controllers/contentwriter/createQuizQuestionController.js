"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createQuizQuestionService_1 = __importDefault(require("../../services/contentwriter/createQuizQuestionService"));
const courseQuizQuestionMessages_1 = require("../../constants/contentwriter/courseQuizQuestionMessages");
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const quizQuestion_1 = require("../../constants/common/quizQuestion");
const validateOptions = (type, options) => {
    if (type === 'TEXTAREA') {
        return null;
    }
    const providedOptions = Array.isArray(options) ? options : [];
    if (type === 'TOGGLE') {
        if (providedOptions.length !== quizQuestion_1.QUIZ_OPTIONS) {
            return 'COURSE_QUIZ_QUESTION_TOGGLE_OPTIONS_MESSAGE';
        }
    }
    else if (providedOptions.length < quizQuestion_1.QUIZ_OPTIONS) {
        return 'COURSE_QUIZ_QUESTION_MIN_OPTIONS_MESSAGE';
    }
    const correctCount = providedOptions.filter((option) => (option === null || option === void 0 ? void 0 : option.isanswer) === true).length;
    if (type === 'CHECKBOX') {
        if (correctCount < 1) {
            return 'COURSE_QUIZ_QUESTION_MIN_ANSWER_MESSAGE';
        }
    }
    else if (correctCount !== 1) {
        return 'COURSE_QUIZ_QUESTION_SINGLE_ANSWER_MESSAGE';
    }
    return null;
};
const createQuizQuestion = async (req, res) => {
    try {
        const { taskId, question, type, options, status } = req.body;
        const normalizedType = String(type || '').toUpperCase();
        const normalizedStatus = String(status || 'SHOW').toUpperCase();
        const optionError = validateOptions(normalizedType, options);
        if (optionError) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES[optionError]
            });
        }
        const result = await createQuizQuestionService_1.default.createQuizQuestion(taskId, question, normalizedType, options, normalizedStatus);
        if (result.success) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.CREATED).json({
                success: true,
                message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES.COURSE_QUIZ_QUESTION_ADD_SUCCESS_MESSAGE,
                data: result.question
            });
        }
        if (result.taskNotFound) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_TASK_NOT_FOUND_MESSAGE
            });
        }
        if (result.notQuizTask) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_NOT_QUIZ_TASK_MESSAGE
            });
        }
        if (result.duplicateQuestion) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.CONFLICT).json({
                success: false,
                message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_DUPLICATE_MESSAGE
            });
        }
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_ADD_ERROR_MESSAGE
        });
    }
    catch (error) {
        console.error(`Error in creating quiz question: ${error}`);
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_ADD_ERROR_MESSAGE
        });
    }
};
exports.default = { createQuizQuestion };
