import { Request, Response } from 'express';
import updateQuizQuestionStatusService from '../../services/contentwriter/updateQuizQuestionStatusService';
import {
    COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES,
    COURSE_QUIZ_QUESTION_ERROR_MESSAGES,
} from '../../constants/contentwriter/courseQuizQuestionMessages';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';

const updateQuizQuestionStatus = async (req: Request, res: Response) => {
    try {
        const { questionId } = req.params;
        const { status } = req.body || {};

        const result = await updateQuizQuestionStatusService.updateQuizQuestionStatus(questionId, status);

        if (result.success) {
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES.COURSE_QUIZ_QUESTION_SHOW_HIDE_SUCCESS_MESSAGE ||
                    COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES.COURSE_QUIZ_QUESTION_STATUS_UPDATE_SUCCESS_MESSAGE,
                data: result.question
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

        if (result.invalidStatus) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_VALIDATION_ERROR_MESSAGE
            });
        }

        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_STATUS_UPDATE_ERROR_MESSAGE
        });
    } catch (error: any) {
        console.error(`Error in updating quiz question status: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_STATUS_UPDATE_ERROR_MESSAGE
        });
    }
};

export default { updateQuizQuestionStatus };
