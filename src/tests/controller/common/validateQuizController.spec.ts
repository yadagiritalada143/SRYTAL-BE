import { Request, Response } from 'express';
import validateQuizController from '../../../controllers/common/validateQuizController';
import validateQuizService from '../../../services/common/validateQuizService';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';
import {
    MY_COURSES_ERROR_MESSAGES,
    MY_COURSES_SUCCESS_MESSAGES
} from '../../../constants/common/myCoursesMessages';

jest.mock('../../../services/common/validateQuizService', () => ({
    __esModule: true,
    default: { validateQuiz: jest.fn() }
}));

const validateQuizMock = validateQuizService.validateQuiz as unknown as jest.Mock;

describe('validateQuizController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        validateQuizMock.mockReset();
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
                answers: [],
                ...overrides.body
            },
            user: { userId: 'emp1' }
        } as unknown as Request);

    const successResult = {
        success: true,
        taskId: '507f1f77bcf86cd799439011',
        attemptId: '507f1f77bcf86cd799439012',
        totalScoredQuestions: 2,
        correctAnswers: 1,
        incorrectAnswers: 1,
        percentage: 50,
        passingPercentage: 60,
        passed: false,
        review: [{ questionId: 'q1', isCorrect: true }]
    };

    it('returns 200 with score and review when successful', async () => {
        validateQuizMock.mockResolvedValue(successResult);
        const req = buildReq();

        await validateQuizController.validateQuiz(req, res);

        expect(validateQuizMock).toHaveBeenCalledWith(
            '507f1f77bcf86cd799439011',
            '507f1f77bcf86cd799439012',
            [],
            'emp1'
        );
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: MY_COURSES_SUCCESS_MESSAGES.QUIZ_VALIDATION_SUCCESS_MESSAGE,
            data: {
                taskId: successResult.taskId,
                attemptId: successResult.attemptId,
                totalScoredQuestions: successResult.totalScoredQuestions,
                correctAnswers: successResult.correctAnswers,
                incorrectAnswers: successResult.incorrectAnswers,
                percentage: successResult.percentage,
                passingPercentage: successResult.passingPercentage,
                passed: successResult.passed,
                review: successResult.review
            }
        });
    });

    it('passes null percentage and passed through for unscored quizzes', async () => {
        validateQuizMock.mockResolvedValue({
            ...successResult,
            totalScoredQuestions: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            percentage: null,
            passed: null,
            review: []
        });
        const req = buildReq();

        await validateQuizController.validateQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ percentage: null, passed: null })
            })
        );
    });

    it('returns 400 when taskId is missing', async () => {
        const req = buildReq({ body: { taskId: undefined } });

        await validateQuizController.validateQuiz(req, res);

        expect(validateQuizMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_VALIDATION_MISSING_FIELDS_MESSAGE
        });
    });

    it('returns 400 when attemptId is missing', async () => {
        const req = buildReq({ body: { attemptId: undefined } });

        await validateQuizController.validateQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_VALIDATION_MISSING_FIELDS_MESSAGE
        });
    });

    it('returns 400 when answers is not an array', async () => {
        const req = buildReq({ body: { answers: 'oops' } });

        await validateQuizController.validateQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_VALIDATION_MISSING_FIELDS_MESSAGE
        });
    });

    it('returns 400 when invalidTaskId', async () => {
        validateQuizMock.mockResolvedValue({ success: false, invalidTaskId: true });
        const req = buildReq();

        await validateQuizController.validateQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_INVALID_TASK_ID_MESSAGE
        });
    });

    it('returns 400 when invalidAttemptId', async () => {
        validateQuizMock.mockResolvedValue({ success: false, invalidAttemptId: true });
        const req = buildReq();

        await validateQuizController.validateQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_INVALID_ATTEMPT_ID_MESSAGE
        });
    });

    it('returns 400 when invalidAnswers', async () => {
        validateQuizMock.mockResolvedValue({ success: false, invalidAnswers: true });
        const req = buildReq();

        await validateQuizController.validateQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_INVALID_ANSWERS_MESSAGE
        });
    });

    it('returns 404 when taskNotFound', async () => {
        validateQuizMock.mockResolvedValue({ success: false, taskNotFound: true });
        const req = buildReq();

        await validateQuizController.validateQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_TASK_NOT_FOUND_MESSAGE
        });
    });

    it('returns 400 when notQuizTask', async () => {
        validateQuizMock.mockResolvedValue({ success: false, notQuizTask: true });
        const req = buildReq();

        await validateQuizController.validateQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_NOT_QUIZ_TASK_MESSAGE
        });
    });

    it('returns 404 when notFound (no assignment)', async () => {
        validateQuizMock.mockResolvedValue({ success: false, notFound: true });
        const req = buildReq();

        await validateQuizController.validateQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.MY_COURSE_NOT_FOUND_MESSAGE
        });
    });

    it('returns 404 when attemptNotFound', async () => {
        validateQuizMock.mockResolvedValue({ success: false, attemptNotFound: true });
        const req = buildReq();

        await validateQuizController.validateQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_ATTEMPT_NOT_FOUND_MESSAGE
        });
    });

    it('returns 409 when attemptAlreadyFinalized', async () => {
        validateQuizMock.mockResolvedValue({ success: false, attemptAlreadyFinalized: true });
        const req = buildReq();

        await validateQuizController.validateQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CONFLICT);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_ATTEMPT_ALREADY_FINALIZED_MESSAGE
        });
    });

    it('returns 500 when service returns unexpected error', async () => {
        validateQuizMock.mockResolvedValue({ success: false });
        const req = buildReq();

        await validateQuizController.validateQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_VALIDATION_ERROR_MESSAGE
        });
    });

    it('returns 500 on exception', async () => {
        validateQuizMock.mockRejectedValue(new Error('db error'));
        const req = buildReq();

        await validateQuizController.validateQuiz(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_VALIDATION_ERROR_MESSAGE
        });
    });
});
