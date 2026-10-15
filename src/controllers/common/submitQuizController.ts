import { Request, Response } from 'express';
import submitQuizService from '../../services/common/submitQuizService';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import { MY_COURSES_ERROR_MESSAGES, MY_COURSES_SUCCESS_MESSAGES } from '../../constants/common/myCoursesMessages';

const submitQuiz = async (req: Request, res: Response) => {
    try {
        const { taskId, attemptId } = req.body;

        if (!taskId || !attemptId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_SUBMIT_MISSING_FIELDS_MESSAGE
            });
        }

        const submission = await submitQuizService.submitQuiz(
            taskId,
            attemptId,
            req.user?.userId as string
        );

        if (submission.success) {
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MY_COURSES_SUCCESS_MESSAGES.QUIZ_SUBMIT_SUCCESS_MESSAGE,
                data: {
                    taskId: submission.taskId,
                    attemptId: submission.attemptId,
                    attemptNumber: submission.attemptNumber,
                    totalScoredQuestions: submission.totalScoredQuestions,
                    correctAnswers: submission.correctAnswers,
                    incorrectAnswers: submission.incorrectAnswers,
                    percentage: submission.percentage,
                    passingPercentage: submission.passingPercentage,
                    passed: submission.passed,
                    alreadySubmitted: submission.alreadySubmitted === true,
                    reattemptRequired: false,
                    courseStatus: submission.courseStatus,
                    progress: submission.progress,
                    isCompleted: submission.isCompleted,
                    completedAt: submission.completedAt
                }
            });
        }

        if (submission.invalidTaskId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_INVALID_TASK_ID_MESSAGE
            });
        }

        if (submission.invalidAttemptId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_INVALID_ATTEMPT_ID_MESSAGE
            });
        }

        if (submission.taskNotFound) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_TASK_NOT_FOUND_MESSAGE
            });
        }

        if (submission.notQuizTask) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_NOT_QUIZ_TASK_MESSAGE
            });
        }

        if (submission.taskInactive) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_TASK_NOT_ACTIVE_MESSAGE
            });
        }

        // No assignment covering this task for the employee — same 404 the other
        // assignment-scoped endpoints use.
        if (submission.notFound) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.MY_COURSE_NOT_FOUND_MESSAGE
            });
        }

        // The attempt does not exist on this employee's progress row — treat as
        // not found so attempt ids are not enumerable.
        if (submission.attemptNotFound) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_ATTEMPT_NOT_FOUND_MESSAGE
            });
        }

        if (submission.attemptNotValidated) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_ATTEMPT_NOT_VALIDATED_MESSAGE
            });
        }

        // Failed score: not eligible for finalization. Return the score together
        // with the reattempt requirement; the task is not completed.
        if (submission.notPassed) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_NOT_PASSED_MESSAGE,
                data: {
                    taskId: submission.taskId,
                    attemptId: submission.attemptId,
                    attemptNumber: submission.attemptNumber,
                    totalScoredQuestions: submission.totalScoredQuestions,
                    correctAnswers: submission.correctAnswers,
                    incorrectAnswers: submission.incorrectAnswers,
                    percentage: submission.percentage,
                    passingPercentage: submission.passingPercentage,
                    passed: submission.passed,
                    reattemptRequired: true
                }
            });
        }

        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_SUBMIT_ERROR_MESSAGE
        });
    } catch (error: any) {
        console.error(`Error in submitting quiz: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_SUBMIT_ERROR_MESSAGE
        });
    }
};

export default { submitQuiz };
