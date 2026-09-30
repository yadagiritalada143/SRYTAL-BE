import { Request, Response } from 'express';
import getCourseTaskQuestionsService from '../../services/contentwriter/getCourseTaskQuestionsService';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import {
    COURSE_TASK_QUESTION_SUCCESS_MESSAGES,
    COURSE_TASK_QUESTION_ERROR_MESSAGES
} from '../../constants/contentwriter/coursetaskQuestionMessages';

/**
 * GET /contentwriter/getCourseTaskQuestions/:taskId
 *
 * The questions of a coding task, so the authoring UI can list them, see which
 * are published and show the starters a writer supplied.
 */
const getCourseTaskQuestions = async (req: Request, res: Response) => {
    try {
        const { taskId } = req.params;

        const response = await getCourseTaskQuestionsService.getCourseTaskQuestions(taskId);

        if (response.notFound) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: COURSE_TASK_QUESTION_ERROR_MESSAGES.COURSE_TASK_NOT_FOUND_MESSAGE
            });
        }

        if (!response.success) {
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: COURSE_TASK_QUESTION_ERROR_MESSAGES.COURSE_TASK_QUESTION_FETCH_ERROR_MESSAGE
            });
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: COURSE_TASK_QUESTION_SUCCESS_MESSAGES.COURSE_TASK_QUESTION_FETCH_SUCCESS_MESSAGE,
            taskId: response.taskId,
            taskName: response.taskName,
            isCoding: response.isCoding,
            questionCount: response.questionCount,
            activeQuestionCount: response.activeQuestionCount,
            questions: (response.questions || []).map((question) => ({
                questionId: question.questionId === null ? null : String(question.questionId),
                question: question.question,
                description: question.description,
                status: question.status,
                order: question.order,
                starterCode: question.starterCode || []
            }))
        });
    } catch (error: any) {
        console.error(`Error in fetching course task questions: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: COURSE_TASK_QUESTION_ERROR_MESSAGES.COURSE_TASK_QUESTION_FETCH_ERROR_MESSAGE
        });
    }
};

export default { getCourseTaskQuestions };
