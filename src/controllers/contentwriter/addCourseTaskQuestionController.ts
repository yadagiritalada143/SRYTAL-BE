import { Request, Response } from 'express';
import addCourseTaskQuestionService from '../../services/contentwriter/addCourseTaskQuestionService';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import {
    COURSE_TASK_QUESTION_SUCCESS_MESSAGES,
    COURSE_TASK_QUESTION_ERROR_MESSAGES
} from '../../constants/contentwriter/coursetaskQuestionMessages';

/**
 * POST /contentwriter/addCourseTaskQuestion
 *
 * Attaches one more question to a coding task. Content writers send only the
 * question text and an optional description - the per-language starter code is
 * generated for each question and language on first open, so there is no
 * starter-code field to fill in here.
 */
const addCourseTaskQuestion = async (req: Request, res: Response) => {
    try {
        const { taskId, question, description } = req.body || {};

        const response = await addCourseTaskQuestionService.addCourseTaskQuestion({
            taskId,
            question,
            description
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

        if (response.duplicateQuestion) {
            return res.status(HTTP_STATUS.CONFLICT).json({
                success: false,
                message: COURSE_TASK_QUESTION_ERROR_MESSAGES.COURSE_TASK_QUESTION_DUPLICATE_MESSAGE
            });
        }

        if (response.limitReached) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: COURSE_TASK_QUESTION_ERROR_MESSAGES.COURSE_TASK_QUESTION_LIMIT_MESSAGE
            });
        }

        if (!response.success) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: COURSE_TASK_QUESTION_ERROR_MESSAGES.COURSE_TASK_QUESTION_MISSING_TEXT_MESSAGE
            });
        }

        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: COURSE_TASK_QUESTION_SUCCESS_MESSAGES.COURSE_TASK_QUESTION_ADD_SUCCESS_MESSAGE,
            taskId: response.taskId,
            questionId: response.questionId,
            questionCount: response.questionCount
        });
    } catch (error: any) {
        console.error(`Error in adding a course task question: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: COURSE_TASK_QUESTION_ERROR_MESSAGES.COURSE_TASK_QUESTION_ADD_ERROR_MESSAGE
        });
    }
};

export default { addCourseTaskQuestion };
