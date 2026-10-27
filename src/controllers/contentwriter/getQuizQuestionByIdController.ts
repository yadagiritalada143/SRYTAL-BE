import { Request, Response } from 'express';
import getQuizQuestionByIdService from '../../services/contentwriter/getQuizQuestionByIdService';
import { COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES, COURSE_QUIZ_QUESTION_ERROR_MESSAGES } from '../../constants/contentwriter/courseQuizQuestionMessages';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';

const getQuizQuestionById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_INVALID_TASK_ID_MESSAGE
            });
        }

        const result = await getQuizQuestionByIdService.getQuizQuestionById(id);

        if (result.success) {
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES.COURSE_QUIZ_QUESTION_FETCH_SINGLE_SUCCESS_MESSAGE,
                data: result.question
            });
        }

        if (result.questionNotFound) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_QUESTION_NOT_FOUND_MESSAGE
            });
        }

        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_FETCH_SINGLE_ERROR_MESSAGE
        });
    } catch (error: any) {
        console.error(`Error in fetching quiz question: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_FETCH_SINGLE_ERROR_MESSAGE
        });
    }
};

export default { getQuizQuestionById };
