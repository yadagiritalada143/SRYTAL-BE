"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const runCodeService_1 = __importDefault(require("../../services/common/runCodeService"));
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const codingQuestionMessages_1 = require("../../constants/common/codingQuestionMessages");
/**
 * Submit Code: the employee's final answer for a coding question. Runs the
 * exact same grading engine as Run Code (generate/reuse test cases -> Piston
 * execution -> compare -> score -> AI quality analysis) but persists the
 * result as a `type: 'submit'` document in the code-run collection. Course
 * progress (task-completion) is intentionally NOT touched here — the frontend
 * drives that separately through the existing task-progress endpoint.
 */
const submitCode = async (req, res) => {
    var _a;
    try {
        const { questionId, language, code } = req.body;
        if (!questionId || !language || typeof code !== 'string' || code.trim() === '') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: codingQuestionMessages_1.CODING_QUESTION_ERROR_MESSAGES.RUN_CODE_MISSING_FIELDS_MESSAGE
            });
        }
        const response = await runCodeService_1.default.runCode(questionId, language, code, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId, 'submit');
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
            if (response.notAllTestsPassed) {
                return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: codingQuestionMessages_1.CODING_QUESTION_ERROR_MESSAGES.SUBMIT_ALL_TESTS_MUST_PASS_MESSAGE
                });
            }
        }
        return res.status(commonErrorMessages_1.HTTP_STATUS.OK).json({
            success: true,
            message: codingQuestionMessages_1.CODING_QUESTION_SUCCESS_MESSAGES.SUBMIT_CODE_SUCCESS_MESSAGE,
            data: response.executionResult
        });
    }
    catch (error) {
        if (error.message === 'USER_OPENROUTER_KEY_NOT_FOUND' ||
            error.message === 'OPENROUTER_KEY_NOT_FOUND') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: codingQuestionMessages_1.CODING_QUESTION_ERROR_MESSAGES.OPENROUTER_KEY_NOT_FOUND_MESSAGE
            });
        }
        if (error.message === 'TEST_CASES_GENERATION_IN_PROGRESS') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.CONFLICT).json({
                success: false,
                message: codingQuestionMessages_1.CODING_QUESTION_ERROR_MESSAGES.TEST_CASES_GENERATION_IN_PROGRESS_MESSAGE
            });
        }
        if (error.message === 'INVALID_GENERATED_TEST_CASES') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: codingQuestionMessages_1.CODING_QUESTION_ERROR_MESSAGES.INVALID_GENERATED_TEST_CASES_MESSAGE
            });
        }
        if (error.message === 'OPENROUTER_KEY_INVALID') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: codingQuestionMessages_1.CODING_QUESTION_ERROR_MESSAGES.OPENROUTER_KEY_INVALID_MESSAGE
            });
        }
        if (error.message === 'OPENROUTER_TEST_CASE_GENERATION_TIMEOUT') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.GATEWAY_TIMEOUT).json({
                success: false,
                message: codingQuestionMessages_1.CODING_QUESTION_ERROR_MESSAGES.OPENROUTER_TEST_CASE_GENERATION_TIMEOUT_MESSAGE
            });
        }
        if (error.message === 'TEST_CASES_GENERATION_FAILED') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: codingQuestionMessages_1.CODING_QUESTION_ERROR_MESSAGES.TEST_CASES_GENERATION_FAILED_MESSAGE
            });
        }
        console.error(`Error in submitting code: ${error}`);
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: codingQuestionMessages_1.CODING_QUESTION_ERROR_MESSAGES.SUBMIT_CODE_ERROR_MESSAGE
        });
    }
};
exports.default = { submitCode };
