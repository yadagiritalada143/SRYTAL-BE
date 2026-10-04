import { Request, Response } from 'express';
import getQuestionService from '../../services/common/getQuestionService';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import {
    CODING_QUESTION_SUCCESS_MESSAGES,
    CODING_QUESTION_ERROR_MESSAGES
} from '../../constants/common/codingQuestionMessages';

const getQuestion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const languageId = String(req.query.languageId || '');
        const taskQuestionId = String(req.query.taskQuestionId || '');

        const questionId =
            String(req.query.questionId || '') || taskQuestionId;

        const userId = req.user?.userId;

        // Validate question/task id
        if (!id) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message:
                    CODING_QUESTION_ERROR_MESSAGES.QUESTION_NOT_FOUND_MESSAGE
            });
        }

        // Validate authenticated user
        if (!userId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'User authentication required'
            });
        }

        console.log('Get Question Request:', {
            id,
            userId,
            questionId,
            languageId
        });

        const response = await getQuestionService.getQuestion(
            id,
            '', // language - resolved from languageId
            userId, // employeeId
            languageId,
            questionId
        );

        if (!response.success) {
            if (response.notFound) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message:
                        CODING_QUESTION_ERROR_MESSAGES
                            .QUESTION_NOT_FOUND_MESSAGE
                });
            }

            if (response.questionNotFound) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message:
                        CODING_QUESTION_ERROR_MESSAGES
                            .TASK_QUESTION_NOT_FOUND_MESSAGE
                });
            }

            if (response.notCodingQuestion) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message:
                        CODING_QUESTION_ERROR_MESSAGES
                            .NOT_CODING_QUESTION_MESSAGE
                });
            }

            if (response.notAssigned) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message:
                        CODING_QUESTION_ERROR_MESSAGES
                            .QUESTION_NOT_ASSIGNED_MESSAGE
                });
            }

            if (response.invalidLanguage) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message:
                        CODING_QUESTION_ERROR_MESSAGES
                            .INVALID_LANGUAGE_MESSAGE
                });
            }

            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Unable to fetch coding question'
            });
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message:
                CODING_QUESTION_SUCCESS_MESSAGES
                    .CODING_QUESTION_FETCH_SUCCESS_MESSAGE,
            questionId: response.questionId,
            taskQuestionId: response.taskQuestionId ?? null,
            taskName: response.taskName,
            question: response.question,
            description: response.description,
            allowedLanguages: response.allowedLanguages,
            language: response.language,
            languageId: response.languageId,
            starterCode: response.starterCode,
            lastSubmittedCode: response.lastSubmittedCode
        });

    } catch (error: any) {
        console.error(
            `Error in fetching coding question: ${error?.message || error}`
        );

        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message:
                CODING_QUESTION_ERROR_MESSAGES
                    .CODING_QUESTION_FETCH_ERROR_MESSAGE
        });
    }
};

export default {
    getQuestion
};
