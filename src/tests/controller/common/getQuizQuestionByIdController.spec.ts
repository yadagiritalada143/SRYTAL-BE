import { Request, Response } from 'express';
import getQuizQuestionByIdController from '../../../controllers/contentwriter/getQuizQuestionByIdController';
import getQuizQuestionByIdService from '../../../services/contentwriter/getQuizQuestionByIdService';
import {
    COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES,
    COURSE_QUIZ_QUESTION_ERROR_MESSAGES,
} from '../../../constants/contentwriter/courseQuizQuestionMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/contentwriter/getQuizQuestionByIdService');

describe('getQuizQuestionByIdController', () => {
    let mockStatus: jest.Mock;
    let mockJson: jest.Mock;
    let res: Response;
    const getQuizQuestionByIdMock = getQuizQuestionByIdService.getQuizQuestionById as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockStatus = jest.fn().mockReturnThis();
        mockJson = jest.fn().mockReturnThis();
        res = { status: mockStatus, json: mockJson } as unknown as Response;
    });

    const buildReq = (id: string) => ({ params: { id } } as unknown as Request);
    const validId = '66d323456789abcdef123456';

    it('returns 400 for an invalid question id without calling service', async () => {
        await getQuizQuestionByIdController.getQuizQuestionById(buildReq('invalid'), res);

        expect(getQuizQuestionByIdMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_INVALID_TASK_ID_MESSAGE
        });
    });

    it('returns 200 with question when found', async () => {
        const question = { _id: validId, question: 'Q1' };
        getQuizQuestionByIdMock.mockResolvedValue({ success: true, question });

        await getQuizQuestionByIdController.getQuizQuestionById(buildReq(validId), res);

        expect(getQuizQuestionByIdMock).toHaveBeenCalledWith(validId);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES.COURSE_QUIZ_QUESTION_FETCH_SINGLE_SUCCESS_MESSAGE,
            data: question
        });
    });

    it('returns 404 when question not found', async () => {
        getQuizQuestionByIdMock.mockResolvedValue({ success: false, questionNotFound: true });

        await getQuizQuestionByIdController.getQuizQuestionById(buildReq(validId), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_QUESTION_NOT_FOUND_MESSAGE
        });
    });

    it('returns 500 when service fails', async () => {
        getQuizQuestionByIdMock.mockResolvedValue({ success: false });

        await getQuizQuestionByIdController.getQuizQuestionById(buildReq(validId), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_FETCH_SINGLE_ERROR_MESSAGE
        });
    });

    it('returns 500 on exception', async () => {
        getQuizQuestionByIdMock.mockRejectedValue(new Error('boom'));

        await getQuizQuestionByIdController.getQuizQuestionById(buildReq(validId), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });
});
