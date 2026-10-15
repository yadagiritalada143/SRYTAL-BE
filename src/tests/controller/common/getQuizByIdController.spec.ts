import { Request, Response } from 'express';
import getQuizByIdController from '../../../controllers/common/getQuizByIdController';
import getQuizByIdService from '../../../services/common/getQuizByIdService';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';
import {
    MY_COURSES_ERROR_MESSAGES,
    MY_COURSES_SUCCESS_MESSAGES
} from '../../../constants/common/myCoursesMessages';

jest.mock('../../../services/common/getQuizByIdService', () => ({
    __esModule: true,
    default: { getQuizById: jest.fn() }
}));

const getQuizByIdMock = getQuizByIdService.getQuizById as unknown as jest.Mock;

describe('getQuizByIdController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getQuizByIdMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const buildReq = (overrides: any = {}) =>
        ({
            params: { taskId: '507f1f77bcf86cd799439011', ...overrides.params },
            user: { userId: 'emp1' }
        } as unknown as Request);

    it('returns 200 with data when successful', async () => {
        const response = {
            success: true,
            taskId: '507f1f77bcf86cd799439011',
            attemptId: 'attempt123',
            taskName: 'JavaScript Quiz',
            totalQuestions: 2,
            questions: []
        };
        getQuizByIdMock.mockResolvedValue(response);
        const req = buildReq();

        await getQuizByIdController.getQuizById(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: MY_COURSES_SUCCESS_MESSAGES.QUIZ_FETCH_SUCCESS_MESSAGE,
            data: {
                taskId: response.taskId,
                attemptId: response.attemptId,
                taskName: response.taskName,
                totalQuestions: response.totalQuestions,
                questions: response.questions
            }
        });
    });

    it('returns 400 when taskId missing', async () => {
        const req = buildReq({ params: { taskId: undefined } });

        await getQuizByIdController.getQuizById(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_INVALID_TASK_ID_MESSAGE
        });
    });

    it('returns 400 when invalidTaskId', async () => {
        getQuizByIdMock.mockResolvedValue({ success: false, invalidTaskId: true });
        const req = buildReq();

        await getQuizByIdController.getQuizById(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_INVALID_TASK_ID_MESSAGE
        });
    });

    it('returns 404 when taskNotFound', async () => {
        getQuizByIdMock.mockResolvedValue({ success: false, taskNotFound: true });
        const req = buildReq();

        await getQuizByIdController.getQuizById(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_TASK_NOT_FOUND_MESSAGE
        });
    });

    it('returns 400 when notQuizTask', async () => {
        getQuizByIdMock.mockResolvedValue({ success: false, notQuizTask: true });
        const req = buildReq();

        await getQuizByIdController.getQuizById(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_NOT_QUIZ_TASK_MESSAGE
        });
    });

    it('returns 400 when taskInactive', async () => {
        getQuizByIdMock.mockResolvedValue({ success: false, taskInactive: true });
        const req = buildReq();

        await getQuizByIdController.getQuizById(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_TASK_NOT_ACTIVE_MESSAGE
        });
    });

    it('returns 404 when notFound (unauthorized/no assignment)', async () => {
        getQuizByIdMock.mockResolvedValue({ success: false, notFound: true });
        const req = buildReq();

        await getQuizByIdController.getQuizById(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.MY_COURSE_NOT_FOUND_MESSAGE
        });
    });

    it('returns 500 when service returns unexpected error', async () => {
        getQuizByIdMock.mockResolvedValue({ success: false });
        const req = buildReq();

        await getQuizByIdController.getQuizById(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_FETCH_ERROR_MESSAGE
        });
    });

    it('returns 500 on exception', async () => {
        getQuizByIdMock.mockRejectedValue(new Error('db error'));
        const req = buildReq();

        await getQuizByIdController.getQuizById(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.QUIZ_FETCH_ERROR_MESSAGE
        });
    });
});
