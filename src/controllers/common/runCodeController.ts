import { Request, Response } from 'express';
import runCodeService from '../../services/common/runCodeService';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import {
    CODING_QUESTION_SUCCESS_MESSAGES,
    CODING_QUESTION_ERROR_MESSAGES
} from '../../constants/common/codingQuestionMessages';

const runCode = async (req: Request, res: Response) => {
    try {
        const { questionId, language, code } = req.body;

        if (!questionId || !language || typeof code !== 'string' || code.trim() === '') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: CODING_QUESTION_ERROR_MESSAGES.RUN_CODE_MISSING_FIELDS_MESSAGE
            });
        }

        const response = await runCodeService.runCode(
            questionId,
            language,
            code,
            req.user?.userId as string
        );

        if (!response.success) {
            if (response.notFound) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: CODING_QUESTION_ERROR_MESSAGES.QUESTION_NOT_FOUND_MESSAGE
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
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: CODING_QUESTION_SUCCESS_MESSAGES.RUN_CODE_SUCCESS_MESSAGE,
            data: response.executionResult
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

        console.error(`Error in running code: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: CODING_QUESTION_ERROR_MESSAGES.RUN_CODE_ERROR_MESSAGE
        });
    }
};

export default { runCode };