"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getCodingQuestionService_1 = __importDefault(require("../../services/common/getCodingQuestionService"));
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const codingQuestionMessages_1 = require("../../constants/common/codingQuestionMessages");
const getCodingQuestion = async (req, res) => {
    var _a;
    try {
        const { questionId } = req.params;
        const language = req.query.language || '';
        if (!questionId) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: codingQuestionMessages_1.CODING_QUESTION_ERROR_MESSAGES.QUESTION_NOT_FOUND_MESSAGE
            });
        }
        const response = await getCodingQuestionService_1.default.getCodingQuestion(questionId, language, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        if (!response.success) {
            if (response.notFound) {
                return res.status(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: codingQuestionMessages_1.CODING_QUESTION_ERROR_MESSAGES.QUESTION_NOT_FOUND_MESSAGE
                });
            }
            if (response.notCodingQuestion) {
                return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: codingQuestionMessages_1.CODING_QUESTION_ERROR_MESSAGES.NOT_CODING_QUESTION_MESSAGE
                });
            }
            if (response.notAssigned) {
                return res.status(commonErrorMessages_1.HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message: codingQuestionMessages_1.CODING_QUESTION_ERROR_MESSAGES.QUESTION_NOT_ASSIGNED_MESSAGE
                });
            }
            if (response.invalidLanguage) {
                return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: codingQuestionMessages_1.CODING_QUESTION_ERROR_MESSAGES.INVALID_LANGUAGE_MESSAGE
                });
            }
        }
        return res.status(commonErrorMessages_1.HTTP_STATUS.OK).json({
            success: true,
            message: codingQuestionMessages_1.CODING_QUESTION_SUCCESS_MESSAGES.CODING_QUESTION_FETCH_SUCCESS_MESSAGE,
            question: response.question
        });
    }
    catch (error) {
        console.error(`Error in fetching coding question: ${error}`);
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: codingQuestionMessages_1.CODING_QUESTION_ERROR_MESSAGES.CODING_QUESTION_FETCH_ERROR_MESSAGE
        });
    }
};
exports.default = { getCodingQuestion };
