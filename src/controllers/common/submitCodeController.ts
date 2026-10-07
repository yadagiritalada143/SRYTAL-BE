import { Request, Response } from 'express';
import runCodeService from '../../services/common/runCodeService';
import { resolveRunScope } from '../../util/courseTaskQuestions';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import {
    CODING_QUESTION_SUCCESS_MESSAGES,
    CODING_QUESTION_ERROR_MESSAGES
} from '../../constants/common/codingQuestionMessages';

/**
 * Submit Code: the employee's final answer for one question of a coding task.
 * Runs the exact same grading engine as Run Code (generate/reuse test cases ->
 * Wandbox execution -> compare -> score -> AI quality analysis) but persists the
 * result as a `type: 'submit'` document in the code-run collection. The response
 * also carries `lastSubmission`: the last code that employee ran or submitted
 * (any coding question, newest first), or null if they have never run anything.
 *
 * A submit is only accepted once every test case passes, so a successful call is
 * also what moves the question - and, once every question of the task has been
 * passed, the task - to complete. The client must therefore not drive coding-task
 * progress through /updateMyTaskProgress.
 */
const submitCode = async (req: Request, res: Response) => {
    try {
        const body = req.body || {};
        const { code } = body;
        // `taskId` is the coding task, `questionId` the question inside it. Both
        // are optional so existing clients keep working: a body that only sends
        // `questionId` is read as the pre-multi-question shape, where that field
        // held the task id.
        const { taskId, questionId } = resolveRunScope(body);
        // Accept the language as either `language` (documented contract, used by
        // the frontend) or `languageId` (what some clients send by mistake).
        const languageId =
            typeof body.language === 'string' && body.language.trim() !== ''
                ? body.language
                : typeof body.languageId === 'string'
                    ? body.languageId
                    : '';

        if (!taskId || typeof languageId !== 'string' || languageId.trim() === '' || typeof code !== 'string' || code.trim() === '') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: CODING_QUESTION_ERROR_MESSAGES.RUN_CODE_MISSING_FIELDS_MESSAGE
            });
        }

        const response = await runCodeService.runCode(
            taskId,
            questionId,
            languageId,
            code,
            req.user?.userId as string,
            'submit'
        );

        if (!response.success) {
            if (response.notFound) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: CODING_QUESTION_ERROR_MESSAGES.QUESTION_NOT_FOUND_MESSAGE
                });
            }

            if (response.questionNotFound) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: CODING_QUESTION_ERROR_MESSAGES.TASK_QUESTION_NOT_FOUND_MESSAGE
                });
            }

            if (response.notCodingQuestion) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: CODING_QUESTION_ERROR_MESSAGES.NOT_CODING_QUESTION_MESSAGE
                });
            }

            if (response.notAssigned) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message: CODING_QUESTION_ERROR_MESSAGES.QUESTION_NOT_ASSIGNED_MESSAGE
                });
            }

            if (response.invalidLanguage) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: CODING_QUESTION_ERROR_MESSAGES.INVALID_LANGUAGE_MESSAGE
                });
            }

            if (response.notAllTestsPassed) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: CODING_QUESTION_ERROR_MESSAGES.SUBMIT_ALL_TESTS_MUST_PASS_MESSAGE
                });
            }
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: CODING_QUESTION_SUCCESS_MESSAGES.SUBMIT_CODE_SUCCESS_MESSAGE,
            data: response.executionResult,
            lastSubmission: response.lastSubmission ?? null
        });
    } catch (error: any) {
        if (
            error.message === 'USER_OPENROUTER_KEY_NOT_FOUND' ||
            error.message === 'OPENROUTER_KEY_NOT_FOUND'
        ) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: CODING_QUESTION_ERROR_MESSAGES.OPENROUTER_KEY_NOT_FOUND_MESSAGE
            });
        }

        if (error.message === 'TEST_CASES_GENERATION_IN_PROGRESS') {
            return res.status(HTTP_STATUS.CONFLICT).json({
                success: false,
                message: CODING_QUESTION_ERROR_MESSAGES.TEST_CASES_GENERATION_IN_PROGRESS_MESSAGE
            });
        }

        if (error.message === 'INVALID_GENERATED_TEST_CASES') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: CODING_QUESTION_ERROR_MESSAGES.INVALID_GENERATED_TEST_CASES_MESSAGE
            });
        }

        if (error.message === 'OPENROUTER_KEY_INVALID') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: CODING_QUESTION_ERROR_MESSAGES.OPENROUTER_KEY_INVALID_MESSAGE
            });
        }

        if (error.message === 'OPENROUTER_TEST_CASE_GENERATION_TIMEOUT') {
            return res.status(HTTP_STATUS.GATEWAY_TIMEOUT).json({
                success: false,
                message: CODING_QUESTION_ERROR_MESSAGES.OPENROUTER_TEST_CASE_GENERATION_TIMEOUT_MESSAGE
            });
        }

        if (error.message === 'TEST_CASES_GENERATION_FAILED') {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: CODING_QUESTION_ERROR_MESSAGES.TEST_CASES_GENERATION_FAILED_MESSAGE
            });
        }

        console.error(`Error in submitting code: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: CODING_QUESTION_ERROR_MESSAGES.SUBMIT_CODE_ERROR_MESSAGE
        });
    }
};

export default { submitCode };
