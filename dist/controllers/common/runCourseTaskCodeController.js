"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const codingTaskMessages_1 = require("../../constants/common/codingTaskMessages");
const runCourseTaskCodeSchema_1 = __importDefault(require("../../middlewares/schemas/runCourseTaskCodeSchema"));
const runCourseTaskCodeService_1 = __importDefault(require("../../services/common/runCourseTaskCodeService"));
const runCourseTaskCode = async (req, res) => {
    var _a;
    const validation = runCourseTaskCodeSchema_1.default.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });
    if (validation.error) {
        return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: codingTaskMessages_1.CODING_TASK_ERROR_MESSAGES.RUN_CODE_MISSING_FIELDS_MESSAGE,
            errors: validation.error.details.map((detail) => detail.message)
        });
    }
    const { taskId, sourceCode } = validation.value;
    const languageId = validation.value.languageId || validation.value.language || '';
    const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '';
    if (!userId) {
        return res.status(commonErrorMessages_1.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: codingTaskMessages_1.CODING_TASK_ERROR_MESSAGES.USER_AUTHENTICATION_REQUIRED_MESSAGE
        });
    }
    try {
        const result = await runCourseTaskCodeService_1.default.runCourseTaskCode(taskId, languageId, sourceCode, userId);
        return res.status(commonErrorMessages_1.HTTP_STATUS.OK).json({
            success: true,
            message: codingTaskMessages_1.CODING_TASK_SUCCESS_MESSAGES.RUN_CODE_SUCCESS_MESSAGE,
            data: result
        });
    }
    catch (error) {
        const errorCode = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
        console.error(`Course task code execution failed: ${errorCode}`);
        if (errorCode === 'INVALID_TASK_ID' ||
            errorCode === 'INVALID_SOURCE_CODE') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: errorCode === 'INVALID_SOURCE_CODE'
                    ? codingTaskMessages_1.CODING_TASK_ERROR_MESSAGES.INVALID_SOURCE_CODE_MESSAGE
                    : codingTaskMessages_1.CODING_TASK_ERROR_MESSAGES.RUN_CODE_MISSING_FIELDS_MESSAGE
            });
        }
        if (errorCode === 'INVALID_LANGUAGE') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: codingTaskMessages_1.CODING_TASK_ERROR_MESSAGES.INVALID_LANGUAGE_MESSAGE
            });
        }
        if (errorCode === 'COURSE_TASK_NOT_FOUND') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: codingTaskMessages_1.CODING_TASK_ERROR_MESSAGES.COURSE_TASK_NOT_FOUND_MESSAGE
            });
        }
        if (errorCode === 'NOT_CODING_TASK') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: codingTaskMessages_1.CODING_TASK_ERROR_MESSAGES.NOT_CODING_TASK_MESSAGE
            });
        }
        if (errorCode === 'CODING_TASK_NAME_REQUIRED') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: codingTaskMessages_1.CODING_TASK_ERROR_MESSAGES.CODING_TASK_NAME_REQUIRED_MESSAGE
            });
        }
        if (errorCode === 'CODING_TASK_DESCRIPTION_REQUIRED') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: codingTaskMessages_1.CODING_TASK_ERROR_MESSAGES.CODING_TASK_DESCRIPTION_REQUIRED_MESSAGE
            });
        }
        if (errorCode === 'TASK_NOT_ASSIGNED') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: codingTaskMessages_1.CODING_TASK_ERROR_MESSAGES.TASK_NOT_ASSIGNED_MESSAGE
            });
        }
        if (errorCode === 'USER_AUTHENTICATION_REQUIRED') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: codingTaskMessages_1.CODING_TASK_ERROR_MESSAGES.USER_AUTHENTICATION_REQUIRED_MESSAGE
            });
        }
        if (errorCode === 'TEST_CASES_NOT_GENERATED') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: codingTaskMessages_1.CODING_TASK_ERROR_MESSAGES.TEST_CASES_NOT_GENERATED_MESSAGE
            });
        }
        if (errorCode === 'USER_OPENROUTER_KEY_NOT_FOUND' ||
            errorCode === 'OPENROUTER_KEY_NOT_FOUND') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: codingTaskMessages_1.CODING_TASK_ERROR_MESSAGES.OPENROUTER_KEY_NOT_FOUND_MESSAGE
            });
        }
        if (errorCode === 'OPENROUTER_KEY_INVALID') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: codingTaskMessages_1.CODING_TASK_ERROR_MESSAGES.OPENROUTER_KEY_INVALID_MESSAGE
            });
        }
        if (errorCode === 'OPENROUTER_ACCOUNT_LIMIT') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: codingTaskMessages_1.CODING_TASK_ERROR_MESSAGES.OPENROUTER_ACCOUNT_LIMIT_MESSAGE
            });
        }
        if (errorCode === 'TEST_CASES_GENERATION_IN_PROGRESS') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.CONFLICT).json({
                success: false,
                message: codingTaskMessages_1.CODING_TASK_ERROR_MESSAGES.TEST_CASES_GENERATION_IN_PROGRESS_MESSAGE
            });
        }
        if (errorCode === 'OPENROUTER_TEST_CASE_GENERATION_TIMEOUT') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.GATEWAY_TIMEOUT).json({
                success: false,
                message: codingTaskMessages_1.CODING_TASK_ERROR_MESSAGES.OPENROUTER_TEST_CASE_GENERATION_TIMEOUT_MESSAGE
            });
        }
        if (errorCode === 'INVALID_GENERATED_TEST_CASES' ||
            errorCode === 'TEST_CASES_GENERATION_FAILED') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_GATEWAY).json({
                success: false,
                message: codingTaskMessages_1.CODING_TASK_ERROR_MESSAGES.TEST_CASES_GENERATION_FAILED_MESSAGE
            });
        }
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: codingTaskMessages_1.CODING_TASK_ERROR_MESSAGES.RUN_CODE_ERROR_MESSAGE
        });
    }
};
exports.default = { runCourseTaskCode };
