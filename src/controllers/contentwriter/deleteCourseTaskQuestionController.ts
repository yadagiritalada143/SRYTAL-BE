import { Request, Response } from 'express';
import deleteCourseTaskQuestionService from '../../services/contentwriter/deleteCourseTaskQuestionService';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import {
    COURSE_TASK_QUESTION_SUCCESS_MESSAGES,
    COURSE_TASK_QUESTION_ERROR_MESSAGES
} from '../../constants/contentwriter/coursetaskQuestionMessages';

/**
 * DELETE /contentwriter/deleteCourseTaskQuestion/:taskId/:questionId
 *
 * Removes one question from a coding task together with its test cases and the
 * runs made against it. The task and its progress record survive.
 */
const deleteCourseTaskQuestion = async (req: Request, res: Response) => {
    try {
        const { taskId, questionId } = req.params;

        const response = await deleteCourseTaskQuestionService.deleteCourseTaskQuestion(taskId, questionId);

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

        if (!response.success) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: COURSE_TASK_QUESTION_ERROR_MESSAGES.COURSE_TASK_QUESTION_DELETE_ERROR_MESSAGE
            });
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: COURSE_TASK_QUESTION_SUCCESS_MESSAGES.COURSE_TASK_QUESTION_DELETE_SUCCESS_MESSAGE,
            taskId: response.taskId,
            questionId: response.questionId,
            questionCount: response.questionCount
        });
    } catch (error: any) {
        console.error(`Error in deleting a course task question: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: COURSE_TASK_QUESTION_ERROR_MESSAGES.COURSE_TASK_QUESTION_DELETE_ERROR_MESSAGE
        });
    }
};

export default { deleteCourseTaskQuestion };
