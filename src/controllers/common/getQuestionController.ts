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
        const language = String(req.query.language || '');
        const languageId = String(req.query.languageId || '');

        if (!id) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: CODING_QUESTION_ERROR_MESSAGES.QUESTION_NOT_FOUND_MESSAGE
            });
        }

        const response = await getQuestionService.getQuestion(
            id,
            language,
            req.user?.userId as string,
            languageId
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
            message: CODING_QUESTION_SUCCESS_MESSAGES.CODING_QUESTION_FETCH_SUCCESS_MESSAGE,
            questionId: response.questionId,
            allowedLanguages: response.allowedLanguages,
            language: response.language,
            languageId: response.languageId,
            starterCode: response.starterCode,
            lastSubmittedCode: response.lastSubmittedCode
        });
    } catch (error: any) {
        console.error(`Error in fetching coding question: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: CODING_QUESTION_ERROR_MESSAGES.CODING_QUESTION_FETCH_ERROR_MESSAGE
        });
    }
};

export default { getQuestion };