import { Request, Response } from 'express';
import deleteQuizQuestionService from '../../services/contentwriter/deleteQuizQuestionService';
import { COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES, COURSE_QUIZ_QUESTION_ERROR_MESSAGES } from '../../constants/contentwriter/courseQuizQuestionMessages';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';

const deleteQuizQuestion = async (req: Request, res: Response) => {
    try {
        const { questionId } = req.params;

        const result = await deleteQuizQuestionService.deleteQuizQuestion(questionId);

        if (result.success) {
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES.COURSE_QUIZ_QUESTION_DELETE_SUCCESS_MESSAGE
            });
        }

        if (result.invalidQuestionId || result.questionNotFound || result.taskNotFound || result.notQuizTask) {
            if (result.questionNotFound) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_QUESTION_NOT_FOUND_MESSAGE
                });
            }
            if (result.taskNotFound) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_TASK_NOT_FOUND_MESSAGE
                });
            }
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_INVALID_TASK_ID_MESSAGE
            });
        }

        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_DELETE_ERROR_MESSAGE
        });
    } catch (error: any) {
        console.error(`Error in deleting quiz question: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_DELETE_ERROR_MESSAGE
        });
    }
};

export default { deleteQuizQuestion };
