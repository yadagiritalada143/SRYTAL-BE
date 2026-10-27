import { Request, Response } from 'express';
import updateQuizQuestionStatusController from '../../../controllers/contentwriter/updateQuizQuestionStatusController';
import updateQuizQuestionStatusService from '../../../services/contentwriter/updateQuizQuestionStatusService';
import {
    COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES,
    COURSE_QUIZ_QUESTION_ERROR_MESSAGES,
} from '../../../constants/contentwriter/courseQuizQuestionMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/contentwriter/updateQuizQuestionStatusService');

describe('updateQuizQuestionStatusController', () => {
    let mockStatus: jest.Mock;
    let mockJson: jest.Mock;
    let res: Response;
    const updateMock = updateQuizQuestionStatusService.updateQuizQuestionStatus as jest.Mock;

    const validId = '66d323456789abcdef123456';

    const buildReq = (status: string, questionId = validId) =>
        ({ params: { questionId }, body: { status } } as unknown as Request);

    beforeEach(() => {
        jest.clearAllMocks();
        mockStatus = jest.fn().mockReturnThis();
        mockJson = jest.fn().mockReturnThis();
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the updated question', async () => {
        const question = { _id: validId, status: 'HIDE' };
        updateMock.mockResolvedValue({ success: true, question });

        await updateQuizQuestionStatusController.updateQuizQuestionStatus(buildReq('HIDE'), res);

        expect(updateMock).toHaveBeenCalledWith(validId, 'HIDE');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES.COURSE_QUIZ_QUESTION_SHOW_HIDE_SUCCESS_MESSAGE,
            data: question
        });
    });

    it('returns 400 for an invalid status', async () => {
        updateMock.mockResolvedValue({ success: false, invalidStatus: true });

        await updateQuizQuestionStatusController.updateQuizQuestionStatus(buildReq('VISIBLE'), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_VALIDATION_ERROR_MESSAGE
        });
    });

    it('returns 404 when the question is not found', async () => {
        updateMock.mockResolvedValue({ success: false, questionNotFound: true });

        await updateQuizQuestionStatusController.updateQuizQuestionStatus(buildReq('HIDE'), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    });

    it('returns 500 when the service fails unexpectedly', async () => {
        updateMock.mockResolvedValue({ success: false });

        await updateQuizQuestionStatusController.updateQuizQuestionStatus(buildReq('HIDE'), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_STATUS_UPDATE_ERROR_MESSAGE
        });
    });

    it('returns 500 when the service throws', async () => {
        updateMock.mockRejectedValue(new Error('boom'));

        await updateQuizQuestionStatusController.updateQuizQuestionStatus(buildReq('HIDE'), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });
});
