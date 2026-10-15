import { Request, Response } from 'express';
import submitQuizController from '../../../controllers/common/submitQuizController';
import submitQuizService from '../../../services/common/submitQuizService';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';
import {
    MY_COURSES_ERROR_MESSAGES,
    MY_COURSES_SUCCESS_MESSAGES
} from '../../../constants/common/myCoursesMessages';

jest.mock('../../../services/common/submitQuizService', () => ({
    __esModule: true,
    default: { submitQuiz: jest.fn() }
}));

const submitQuizMock = submitQuizService.submitQuiz as unknown as jest.Mock;

describe('submitQuizController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        submitQuizMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const buildReq = (overrides: any = {}) =>
        ({
            body: {
                taskId: '507f1f77bcf86cd799439011',
                attemptId: '507f1f77bcf86cd799439012',
                ...overrides.body
            },
            user: { userId: 'emp1' }
        } as unknown as Request);

    const successResult = {
        success: true,
        taskId: '507f1f77bcf86cd799439011',
        attemptId: '507f1f77bcf86cd799439012',
        attemptNumber: 2,
        totalScoredQuestions: 4,
        correctAnswers: 3,
        incorrectAnswers: 1,
        percentage: 75,
        passingPercentage: 60,
        passed: true,
        reattemptRequired: false,
        courseStatus: 'In Progress',
        progress: { totalTasks: 2, completedTasks: 1, percentComplete: 50 },
        isCompleted: true,
        completedAt: new Date('2026-01-01T00:10:00Z')
    };

    it('returns 200 with the finalized result on success', async () => {
        submitQuizMock.mockResolvedValue(successResult);
        const req = buildReq();

        await submitQuizController.submitQuiz(req, res);

        expect(submitQuizMock).toHaveBeenCalledWith(
            '507f1f77bcf86cd799439011',
            '507f1f77bcf86cd799439012',
            'emp1'
        );
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: MY_COURSES_SUCCESS_MESSAGES.QUIZ_SUBMIT_SUCCESS_MESSAGE,
            data: {
                taskId: successResult.taskId,
                attemptId: successResult.attemptId,
                attemptNumber: successResult.attemptNumber,
                totalScoredQuestions: successResult.totalScoredQuestions,
                correctAnswers: successResult.correctAnswers,
                incorrectAnswers: successResult.incorrectAnswers,
                percentage: successResult.percentage,
                passingPercentage: successResult.passingPercentage,
                passed: successResult.passed,
                alreadySubmitted: false,
                reattemptRequired: false,
                courseStatus: successResult.courseStatus,
                progress: successResult.progress,
                isCompleted: successResult.isCompleted,
                completedAt: successResult.completedAt
            }
        });
    });

    it('flags alreadySubmitted on an idempotent repeat', async () => {
        submitQuizMock.mockResolvedValue({ ...successResult, alreadySubmitted: true });
        const req = buildReq();

        await submitQuizController.submitQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                data: expect.objectContaining({ alreadySubmitted: true })
            })
        );
    });

    it('returns 400 when taskId is missing', async () => {
        const req = buildReq({ body: { taskId: undefined } });

        await submitQuizController.submitQuiz(req, res);

        expect(submitQuizMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_SUBMIT_MISSING_FIELDS_MESSAGE
        });
    });

    it('returns 400 when attemptId is missing', async () => {
        const req = buildReq({ body: { attemptId: undefined } });

        await submitQuizController.submitQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_SUBMIT_MISSING_FIELDS_MESSAGE
        });
    });

    it('returns 400 when invalidTaskId', async () => {
        submitQuizMock.mockResolvedValue({ success: false, invalidTaskId: true });
        const req = buildReq();

        await submitQuizController.submitQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_INVALID_TASK_ID_MESSAGE
        });
    });

    it('returns 400 when invalidAttemptId', async () => {
        submitQuizMock.mockResolvedValue({ success: false, invalidAttemptId: true });
        const req = buildReq();

        await submitQuizController.submitQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_INVALID_ATTEMPT_ID_MESSAGE
        });
    });

    it('returns 404 when taskNotFound', async () => {
        submitQuizMock.mockResolvedValue({ success: false, taskNotFound: true });
        const req = buildReq();

        await submitQuizController.submitQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_TASK_NOT_FOUND_MESSAGE
        });
    });

    it('returns 400 when notQuizTask', async () => {
        submitQuizMock.mockResolvedValue({ success: false, notQuizTask: true });
        const req = buildReq();

        await submitQuizController.submitQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_NOT_QUIZ_TASK_MESSAGE
        });
    });

    it('returns 400 when taskInactive', async () => {
        submitQuizMock.mockResolvedValue({ success: false, taskInactive: true });
        const req = buildReq();

        await submitQuizController.submitQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_TASK_NOT_ACTIVE_MESSAGE
        });
    });

    it('returns 404 when notFound (no assignment)', async () => {
        submitQuizMock.mockResolvedValue({ success: false, notFound: true });
        const req = buildReq();

        await submitQuizController.submitQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.MY_COURSE_NOT_FOUND_MESSAGE
        });
    });

    it('returns 404 when attemptNotFound', async () => {
        submitQuizMock.mockResolvedValue({ success: false, attemptNotFound: true });
        const req = buildReq();

        await submitQuizController.submitQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_ATTEMPT_NOT_FOUND_MESSAGE
        });
    });

    it('returns 400 when attemptNotValidated', async () => {
        submitQuizMock.mockResolvedValue({ success: false, attemptNotValidated: true });
        const req = buildReq();

        await submitQuizController.submitQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_ATTEMPT_NOT_VALIDATED_MESSAGE
        });
    });

    it('returns 400 with the score when the attempt did not pass', async () => {
        submitQuizMock.mockResolvedValue({
            success: false,
            notPassed: true,
            taskId: '507f1f77bcf86cd799439011',
            attemptId: '507f1f77bcf86cd799439012',
            attemptNumber: 1,
            totalScoredQuestions: 4,
            correctAnswers: 1,
            incorrectAnswers: 3,
            percentage: 25,
            passingPercentage: 60,
            passed: false,
            reattemptRequired: true
        });
        const req = buildReq();

        await submitQuizController.submitQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_NOT_PASSED_MESSAGE,
            data: {
                taskId: '507f1f77bcf86cd799439011',
                attemptId: '507f1f77bcf86cd799439012',
                attemptNumber: 1,
                totalScoredQuestions: 4,
                correctAnswers: 1,
                incorrectAnswers: 3,
                percentage: 25,
                passingPercentage: 60,
                passed: false,
                reattemptRequired: true
            }
        });
    });

    it('returns 500 when the service returns an unexpected failure', async () => {
        submitQuizMock.mockResolvedValue({ success: false });
        const req = buildReq();

        await submitQuizController.submitQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_SUBMIT_ERROR_MESSAGE
        });
    });

    it('returns 500 on exception', async () => {
        submitQuizMock.mockRejectedValue(new Error('db error'));
        const req = buildReq();

        await submitQuizController.submitQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_SUBMIT_ERROR_MESSAGE
        });
    });
});
