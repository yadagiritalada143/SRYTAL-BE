import { Request, Response } from 'express';
import validateQuizService from '../../services/common/validateQuizService';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import { MY_COURSES_ERROR_MESSAGES, MY_COURSES_SUCCESS_MESSAGES } from '../../constants/common/myCoursesMessages';

const validateQuiz = async (req: Request, res: Response) => {
    try {
        const { taskId, attemptId, answers } = req.body;

        if (!taskId || !attemptId || !Array.isArray(answers)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_VALIDATION_MISSING_FIELDS_MESSAGE
            });
        }

        const validationResult = await validateQuizService.validateQuiz(
            taskId,
            attemptId,
            answers,
            req.user?.userId as string
        );

        if (validationResult.success) {
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: MY_COURSES_SUCCESS_MESSAGES.QUIZ_VALIDATION_SUCCESS_MESSAGE,
                data: {
                    taskId: validationResult.taskId,
                    attemptId: validationResult.attemptId,
                    totalScoredQuestions: validationResult.totalScoredQuestions,
                    correctAnswers: validationResult.correctAnswers,
                    incorrectAnswers: validationResult.incorrectAnswers,
                    percentage: validationResult.percentage,
                    passingPercentage: validationResult.passingPercentage,
                    passed: validationResult.passed,
                    review: validationResult.review
                }
            });
        }

        if (validationResult.invalidTaskId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_INVALID_TASK_ID_MESSAGE
            });
        }

        if (validationResult.invalidAttemptId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_INVALID_ATTEMPT_ID_MESSAGE
            });
        }

        if (validationResult.invalidAnswers) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_INVALID_ANSWERS_MESSAGE
            });
        }

        if (validationResult.taskNotFound) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_TASK_NOT_FOUND_MESSAGE
            });
        }

        if (validationResult.notQuizTask) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_NOT_QUIZ_TASK_MESSAGE
            });
        }

        // No assignment covering this task for the employee — same 404 the
        // other assignment-scoped endpoints use.
        if (validationResult.notFound) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.MY_COURSE_NOT_FOUND_MESSAGE
            });
        }

        // The attempt does not exist on this employee's progress row for this
        // task — treat as not found so attempt ids are not enumerable.
        if (validationResult.attemptNotFound) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_ATTEMPT_NOT_FOUND_MESSAGE
            });
        }

        if (validationResult.attemptAlreadyFinalized) {
            return res.status(HTTP_STATUS.CONFLICT).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.QUIZ_ATTEMPT_ALREADY_FINALIZED_MESSAGE
            });
        }

        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_VALIDATION_ERROR_MESSAGE
        });
    } catch (error: any) {
        console.error(`Error in validating quiz: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_VALIDATION_ERROR_MESSAGE
        });
    }
};

export default { validateQuiz };
