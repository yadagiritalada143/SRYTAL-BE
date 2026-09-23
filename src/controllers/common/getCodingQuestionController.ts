import { Request, Response } from 'express';
import getCodingQuestionService from '../../services/common/getCodingQuestionService';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import {
    CODING_QUESTION_SUCCESS_MESSAGES,
    CODING_QUESTION_ERROR_MESSAGES
} from '../../constants/common/codingQuestionMessages';

const getCodingQuestion = async (req: Request, res: Response) => {
    try {
        const { questionId } = req.params;
        const language = (req.query.language as string) || '';

        if (!questionId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: CODING_QUESTION_ERROR_MESSAGES.QUESTION_NOT_FOUND_MESSAGE
            });
        }

        const response = await getCodingQuestionService.getCodingQuestion(
            questionId,
            language,
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
            message: CODING_QUESTION_SUCCESS_MESSAGES.CODING_QUESTION_FETCH_SUCCESS_MESSAGE,
            question: response.question
        });
    } catch (error: any) {
        console.error(`Error in fetching coding question: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: CODING_QUESTION_ERROR_MESSAGES.CODING_QUESTION_FETCH_ERROR_MESSAGE
        });
    }
};

export default { getCodingQuestion };