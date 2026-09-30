import { Request, Response } from 'express';
import updateCourseTaskQuestionService from '../../services/contentwriter/updateCourseTaskQuestionService';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import {
    COURSE_TASK_QUESTION_SUCCESS_MESSAGES,
    COURSE_TASK_QUESTION_ERROR_MESSAGES
} from '../../constants/contentwriter/coursetaskQuestionMessages';

/**
 * PUT /contentwriter/updateCourseTaskQuestion
 *
 * Edits a single question in place: its text, description, publish state or its
 * writer-supplied starters. Every other question on the task is left untouched,
 * and the questionId is what keeps that true.
 */
const updateCourseTaskQuestion = async (req: Request, res: Response) => {
    try {
        const { taskId, questionId, question, description, status } = req.body || {};

        const response = await updateCourseTaskQuestionService.updateCourseTaskQuestion({
            taskId,
            questionId,
            question,
            description,
            status
        });

        if (response.notFound) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: COURSE_TASK_QUESTION_ERROR_MESSAGES.COURSE_TASK_NOT_FOUND_MESSAGE
            });
        }

        if (response.notCodingTask) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: COURSE_TASK_QUESTION_ERROR_MESSAGES.COURSE_TASK_NOT_CODING_TASK_MESSAGE
            });
        }

        if (response.questionNotFound) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: COURSE_TASK_QUESTION_ERROR_MESSAGES.COURSE_TASK_QUESTION_NOT_FOUND_MESSAGE
            });
        }

        if (response.duplicateQuestion) {
            return res.status(HTTP_STATUS.CONFLICT).json({
                success: false,
                message: COURSE_TASK_QUESTION_ERROR_MESSAGES.COURSE_TASK_QUESTION_DUPLICATE_MESSAGE
            });
        }

        if (!response.success) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: COURSE_TASK_QUESTION_ERROR_MESSAGES.COURSE_TASK_QUESTION_MISSING_TEXT_MESSAGE
            });
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: COURSE_TASK_QUESTION_SUCCESS_MESSAGES.COURSE_TASK_QUESTION_UPDATE_SUCCESS_MESSAGE,
            taskId: response.taskId,
            questionId: response.questionId
        });
    } catch (error: any) {
        console.error(`Error in updating a course task question: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: COURSE_TASK_QUESTION_ERROR_MESSAGES.COURSE_TASK_QUESTION_UPDATE_ERROR_MESSAGE
        });
    }
};

export default { updateCourseTaskQuestion };
