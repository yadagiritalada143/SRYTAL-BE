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
 * Updates one coding question belonging to a task.
 *
 * The question is stored in the TaskCodingQuestionModel collection,
 * therefore only the requested questionId is updated.
 */
const updateCourseTaskQuestion = async (req: Request, res: Response) => {
    try {
        const {
            taskId,
            questionId,
            question,
            description,
            status
        } = req.body || {};

        /** * ---------------------------------------------------------
         * 1. Validate required fields
         * --------------------------------------------------------- */
        if (!taskId || !questionId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message:
                    COURSE_TASK_QUESTION_ERROR_MESSAGES
                        .COURSE_TASK_QUESTION_MISSING_TEXT_MESSAGE
            });
        }

        /** * ---------------------------------------------------------
         * 2. Update question
         * --------------------------------------------------------- */
        const response =
            await updateCourseTaskQuestionService.updateCourseTaskQuestion({
                taskId,
                questionId,
                question,
                description,
                status
            });

        /** * ---------------------------------------------------------
         * 3. Task not found
         * --------------------------------------------------------- */
        if (response.notFound) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message:
                    COURSE_TASK_QUESTION_ERROR_MESSAGES
                        .COURSE_TASK_NOT_FOUND_MESSAGE
            });
        }

        /** * ---------------------------------------------------------
         * 4. Not a coding task
         * --------------------------------------------------------- */
        // if (response.notCodingTask) {
        //     return res.status(HTTP_STATUS.BAD_REQUEST).json({
        //         success: false,
        //         message:
        //             COURSE_TASK_QUESTION_ERROR_MESSAGES
        //                 .COURSE_TASK_NOT_CODING_TASK_MESSAGE
        //     });
        // }

        /** * ---------------------------------------------------------
         * 5. Question not found
         * --------------------------------------------------------- */
        if (response.questionNotFound) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message:
                    COURSE_TASK_QUESTION_ERROR_MESSAGES
                        .COURSE_TASK_QUESTION_NOT_FOUND_MESSAGE
            });
        }

        /** * ---------------------------------------------------------
         * 6. Duplicate question
         * --------------------------------------------------------- */
        if (response.duplicateQuestion) {
            return res.status(HTTP_STATUS.CONFLICT).json({
                success: false,
                message:
                    COURSE_TASK_QUESTION_ERROR_MESSAGES
                        .COURSE_TASK_QUESTION_DUPLICATE_MESSAGE
            });
        }

        /** * ---------------------------------------------------------
         * 7. Invalid question
         * --------------------------------------------------------- */
        // if (response.invalidQuestion) {
        //     return res.status(HTTP_STATUS.BAD_REQUEST).json({
        //         success: false,
        //         message:
        //             COURSE_TASK_QUESTION_ERROR_MESSAGES
        //                 .COURSE_TASK_QUESTION_MISSING_TEXT_MESSAGE
        //     });
        // }

        /** * ---------------------------------------------------------
         * 8. Generic failure
         * --------------------------------------------------------- */
        if (!response.success) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message:
                    COURSE_TASK_QUESTION_ERROR_MESSAGES
                        .COURSE_TASK_QUESTION_UPDATE_ERROR_MESSAGE
            });
        }

        /** * ---------------------------------------------------------
         * 9. Success
         * --------------------------------------------------------- */
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message:
                COURSE_TASK_QUESTION_SUCCESS_MESSAGES
                    .COURSE_TASK_QUESTION_UPDATE_SUCCESS_MESSAGE,
            taskId: response.taskId,
            questionId: response.questionId
        });
    } catch (error: any) {
        console.error(
            'Error in updating course task question:',
            error?.message || error
        );

        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message:
                COURSE_TASK_QUESTION_ERROR_MESSAGES
                    .COURSE_TASK_QUESTION_UPDATE_ERROR_MESSAGE
        });
    }
};

export default { updateCourseTaskQuestion };
