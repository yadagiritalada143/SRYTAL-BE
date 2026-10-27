import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import {
    CODING_TASK_ERROR_MESSAGES,
    CODING_TASK_SUCCESS_MESSAGES
} from '../../constants/common/codingTaskMessages';
import generateCourseTaskTestCasesSchema from '../../middlewares/schemas/generateCourseTaskTestCasesSchema';
import generateCourseTaskTestCasesService from '../../services/common/generateCourseTaskTestCasesService';

const generateCourseTaskTestCases = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const validation = generateCourseTaskTestCasesSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });
    if (validation.error) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: CODING_TASK_ERROR_MESSAGES.INVALID_TEST_CASE_GENERATION_REQUEST_MESSAGE,
            errors: validation.error.details.map((detail) => detail.message)
        });
    }

    const { taskId, forceRegenerate } = validation.value;
    const userId = req.user?.userId || '';
    if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: CODING_TASK_ERROR_MESSAGES.USER_AUTHENTICATION_REQUIRED_MESSAGE
        });
    }

    try {
        const result =
            await generateCourseTaskTestCasesService.generateCourseTaskTestCases(
                taskId,
                userId,
                forceRegenerate
            );
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: result.reused
                ? CODING_TASK_SUCCESS_MESSAGES.TEST_CASES_REUSED_SUCCESS_MESSAGE
                : CODING_TASK_SUCCESS_MESSAGES.TEST_CASES_GENERATED_SUCCESS_MESSAGE,
            data: result
        });
    } catch (error: unknown) {
        const errorCode = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
        console.error(`Course task test-case generation failed: ${errorCode}`);

        if (errorCode === 'INVALID_TASK_ID') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.INVALID_TEST_CASE_GENERATION_REQUEST_MESSAGE
            });
        }
        if (errorCode === 'COURSE_TASK_NOT_FOUND') {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.COURSE_TASK_NOT_FOUND_MESSAGE
            });
        }
        if (errorCode === 'NOT_CODING_TASK') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.NOT_CODING_TASK_MESSAGE
            });
        }
        if (errorCode === 'CODING_TASK_NAME_REQUIRED') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.CODING_TASK_NAME_REQUIRED_MESSAGE
            });
        }
        if (errorCode === 'CODING_TASK_DESCRIPTION_REQUIRED') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.CODING_TASK_DESCRIPTION_REQUIRED_MESSAGE
            });
        }
        if (errorCode === 'TASK_NOT_ASSIGNED') {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.TASK_NOT_ASSIGNED_MESSAGE
            });
        }
        if (errorCode === 'USER_AUTHENTICATION_REQUIRED') {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.USER_AUTHENTICATION_REQUIRED_MESSAGE
            });
        }
        if (
            errorCode === 'USER_OPENROUTER_KEY_NOT_FOUND' ||
            errorCode === 'OPENROUTER_KEY_NOT_FOUND'
        ) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.OPENROUTER_KEY_NOT_FOUND_MESSAGE
            });
        }
        if (errorCode === 'OPENROUTER_KEY_INVALID') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.OPENROUTER_KEY_INVALID_MESSAGE
            });
        }
        if (errorCode === 'OPENROUTER_ACCOUNT_LIMIT') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.OPENROUTER_ACCOUNT_LIMIT_MESSAGE
            });
        }
        if (errorCode === 'TEST_CASES_GENERATION_IN_PROGRESS') {
            return res.status(HTTP_STATUS.CONFLICT).json({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.TEST_CASES_GENERATION_IN_PROGRESS_MESSAGE
            });
        }
        if (
            errorCode === 'INVALID_GENERATED_TEST_CASES' ||
            errorCode === 'STORED_TEST_CASES_INVALID'
        ) {
            return res.status(HTTP_STATUS.BAD_GATEWAY).json({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.INVALID_GENERATED_TEST_CASES_MESSAGE
            });
        }
        if (errorCode === 'OPENROUTER_TEST_CASE_GENERATION_TIMEOUT') {
            return res.status(HTTP_STATUS.GATEWAY_TIMEOUT).json({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.OPENROUTER_TEST_CASE_GENERATION_TIMEOUT_MESSAGE
            });
        }
        if (errorCode === 'TEST_CASES_GENERATION_FAILED') {
            return res.status(HTTP_STATUS.BAD_GATEWAY).json({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.TEST_CASES_GENERATION_FAILED_MESSAGE
            });
        }

        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: CODING_TASK_ERROR_MESSAGES.TEST_CASES_GENERATION_FAILED_MESSAGE
        });
    }
};

export default { generateCourseTaskTestCases };
