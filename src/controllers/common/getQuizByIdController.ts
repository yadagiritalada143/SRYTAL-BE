import { Request, Response } from 'express';
import getQuizByIdService from '../../services/common/getQuizByIdService';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import { MY_COURSES_ERROR_MESSAGES, MY_COURSES_SUCCESS_MESSAGES } from '../../constants/common/myCoursesMessages';

const getQuizById = async (req: Request, res: Response) => {
    try {
        const { taskId } = req.params;

        if (!taskId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_INVALID_TASK_ID_MESSAGE
            });
        }

        const quizResponse = await getQuizByIdService.getQuizById(
            taskId,
            req.user?.userId as string
        );

        if (quizResponse.success) {
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MY_COURSES_SUCCESS_MESSAGES.QUIZ_FETCH_SUCCESS_MESSAGE,
                data: {
                    taskId: quizResponse.taskId,
                    attemptId: quizResponse.attemptId,
                    taskName: quizResponse.taskName,
                    totalQuestions: quizResponse.totalQuestions,
                    questions: quizResponse.questions
                }
            });
        }

        if (quizResponse.invalidTaskId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_INVALID_TASK_ID_MESSAGE
            });
        }

        if (quizResponse.taskNotFound) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_TASK_NOT_FOUND_MESSAGE
            });
        }

        if (quizResponse.notQuizTask) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_NOT_QUIZ_TASK_MESSAGE
            });
        }

        if (quizResponse.taskInactive) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_TASK_NOT_ACTIVE_MESSAGE
            });
        }

        if (quizResponse.notFound) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.MY_COURSE_NOT_FOUND_MESSAGE
            });
        }

        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_FETCH_ERROR_MESSAGE
        });
    } catch (error: any) {
        console.error(`Error in fetching quiz by id: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_FETCH_ERROR_MESSAGE
        });
    }
};

export default { getQuizById };
