"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateQuizQuestionService_1 = __importDefault(require("../../services/contentwriter/updateQuizQuestionService"));
const createQuizQuestionSchema_1 = require("../../middlewares/schemas/createQuizQuestionSchema");
const courseQuizQuestionMessages_1 = require("../../constants/contentwriter/courseQuizQuestionMessages");
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const updateQuizQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { error, value } = createQuizQuestionSchema_1.updateQuizQuestionSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.details[0].message || courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_VALIDATION_ERROR_MESSAGE
            });
        }
        const result = await updateQuizQuestionService_1.default.updateQuizQuestion(Object.assign(Object.assign({}, value), { questionId }));
        if (result.success) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.OK).json({
                success: true,
                message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES.COURSE_QUIZ_QUESTION_UPDATE_SUCCESS_MESSAGE,
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
        if (result.invalidQuestionType || result.invalidQuestion || result.invalidOptions || result.invalidStatus) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: result.message ||
                    courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_VALIDATION_ERROR_MESSAGE
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
            message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_UPDATE_ERROR_MESSAGE
        });
    }
    catch (error) {
        console.error(`Error in updating quiz question: ${error}`);
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: courseQuizQuestionMessages_1.COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_UPDATE_ERROR_MESSAGE
        });
    }
};
exports.default = { updateQuizQuestion };
