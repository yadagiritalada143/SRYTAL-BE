import { Request, Response } from 'express';
import runCodeService from '../../services/common/runCodeService';
import { resolveRunScope } from '../../util/courseTaskQuestions';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import {
    CODING_QUESTION_SUCCESS_MESSAGES,
    CODING_QUESTION_ERROR_MESSAGES
} from '../../constants/common/codingQuestionMessages';

const runCode = async (req: Request, res: Response) => {
    try {
        const body = req.body || {};

        const { code } = body;

        /**
         * taskId = coding task
         * questionId = question inside the coding task
         */
        const { taskId, questionId } = resolveRunScope(body);

        /**
         * Accept:
         * languageId
         *
         * Also keep language support for backward compatibility.
         */
        const languageId =
            typeof body.languageId === 'string' &&
            body.languageId.trim() !== ''
                ? body.languageId.trim()
                : typeof body.language === 'string'
                    ? body.language.trim()
                    : '';

        /**
         * Basic validation
         */
        if (
            !taskId ||
            typeof taskId !== 'string' ||
            !languageId ||
            typeof languageId !== 'string' ||
            typeof code !== 'string' ||
            code.trim() === ''
        ) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message:
                    CODING_QUESTION_ERROR_MESSAGES.RUN_CODE_MISSING_FIELDS_MESSAGE
            });
        }

        /**
         * JWT user
         */
        const employeeId = req.user?.userId;

        if (!employeeId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'User authentication is required.'
            });
        }

        /**
         * Execute code
         */
        const response = await runCodeService.runCode(
            taskId,
            questionId,
            languageId,
            code,
            employeeId,
            'run'
        );

        /**
         * Service-level failures
         */
        if (!response.success) {
            if (response.notFound) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message:
                        CODING_QUESTION_ERROR_MESSAGES.QUESTION_NOT_FOUND_MESSAGE
                });
            }

            if (response.questionNotFound) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message:
                        CODING_QUESTION_ERROR_MESSAGES.TASK_QUESTION_NOT_FOUND_MESSAGE
                });
            }

            if (response.notCodingQuestion) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message:
                        CODING_QUESTION_ERROR_MESSAGES.NOT_CODING_QUESTION_MESSAGE
                });
            }

            if (response.notAssigned) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message:
                        CODING_QUESTION_ERROR_MESSAGES.QUESTION_NOT_ASSIGNED_MESSAGE
                });
            }

            if (response.invalidLanguage) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message:
                        CODING_QUESTION_ERROR_MESSAGES.INVALID_LANGUAGE_MESSAGE
                });
            }

            if (response.notAllTestsPassed) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Not all test cases passed.',
                    data: response.executionResult
                });
            }

            console.error(
                'Run code service returned unsuccessful response:',
                response
            );

            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    CODING_QUESTION_ERROR_MESSAGES.RUN_CODE_ERROR_MESSAGE
            });
        }

        /**
         * Run completed.
         *
         * IMPORTANT:
         * Even if some test cases fail, execution itself was successful.
         * Therefore this remains HTTP 200 and the frontend receives
         * passed/failed test-case information.
         */
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message:
                CODING_QUESTION_SUCCESS_MESSAGES.RUN_CODE_SUCCESS_MESSAGE,
            data: response.executionResult
        });

    } catch (error: any) {
        console.error('========== RUN CODE ERROR ==========');
        console.error('Message:', error?.message);
        console.error('Stack:', error?.stack);
        console.error('Status:', error?.response?.status);
        console.error('Response:', error?.response?.data);
        console.error('====================================');

        if (
            error?.message === 'USER_OPENROUTER_KEY_NOT_FOUND' ||
            error?.message === 'OPENROUTER_KEY_NOT_FOUND'
        ) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message:
                    CODING_QUESTION_ERROR_MESSAGES.OPENROUTER_KEY_NOT_FOUND_MESSAGE
            });
        }

        if (error?.message === 'TEST_CASES_GENERATION_IN_PROGRESS') {
            return res.status(HTTP_STATUS.CONFLICT).json({
                success: false,
                message:
                    CODING_QUESTION_ERROR_MESSAGES
                        .TEST_CASES_GENERATION_IN_PROGRESS_MESSAGE
            });
        }

        if (error?.message === 'INVALID_GENERATED_TEST_CASES') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message:
                    CODING_QUESTION_ERROR_MESSAGES
                        .INVALID_GENERATED_TEST_CASES_MESSAGE
            });
        }

        if (error?.message === 'OPENROUTER_KEY_INVALID') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message:
                    CODING_QUESTION_ERROR_MESSAGES
                        .OPENROUTER_KEY_INVALID_MESSAGE
            });
        }

        if (error?.message === 'OPENROUTER_TEST_CASE_GENERATION_TIMEOUT') {
            return res.status(HTTP_STATUS.GATEWAY_TIMEOUT).json({
                success: false,
                message:
                    CODING_QUESTION_ERROR_MESSAGES
                        .OPENROUTER_TEST_CASE_GENERATION_TIMEOUT_MESSAGE
            });
        }

        if (error?.message === 'OPENROUTER_INSUFFICIENT_CREDITS') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message:
                    'OpenRouter does not have sufficient credits for test-case generation.'
            });
        }

        if (error?.message === 'TEST_CASES_GENERATION_FAILED') {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    CODING_QUESTION_ERROR_MESSAGES
                        .TEST_CASES_GENERATION_FAILED_MESSAGE
            });
        }

        if (error?.message === 'CODE_EXECUTION_TIMEOUT') {
            return res.status(HTTP_STATUS.GATEWAY_TIMEOUT).json({
                success: false,
                message:
                    'Code execution timed out. Please try again.'
            });
        }

        if (error?.message === 'CODE_EXECUTION_FAILED') {
            return res.status(HTTP_STATUS.BAD_GATEWAY).json({
                success: false,
                message:
                    'Code execution service failed. Please try again.'
            });
        }

        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message:
                CODING_QUESTION_ERROR_MESSAGES.RUN_CODE_ERROR_MESSAGE
        });
    }
};

export default {
    runCode
};