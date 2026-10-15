import { Request, Response } from 'express';
import deleteQuizQuestionController from '../../../controllers/contentwriter/deleteQuizQuestionController';
import deleteQuizQuestionService from '../../../services/contentwriter/deleteQuizQuestionService';
import {
    COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES,
    COURSE_QUIZ_QUESTION_ERROR_MESSAGES,
} from '../../../constants/contentwriter/courseQuizQuestionMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/contentwriter/deleteQuizQuestionService');

describe('deleteQuizQuestionController', () => {
    let mockStatus: jest.Mock;
    let mockJson: jest.Mock;
    let res: Response;
    const deleteMock = deleteQuizQuestionService.deleteQuizQuestion as jest.Mock;

    const validId = '66d323456789abcdef123456';
    const buildReq = (questionId = validId) => ({ params: { questionId } } as unknown as Request);

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

    it('returns 200 when the question is deleted', async () => {
        deleteMock.mockResolvedValue({ success: true });

        await deleteQuizQuestionController.deleteQuizQuestion(buildReq(), res);

        expect(deleteMock).toHaveBeenCalledWith(validId);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES.COURSE_QUIZ_QUESTION_DELETE_SUCCESS_MESSAGE
        });
    });

    it('returns 404 when the question is not found', async () => {
        deleteMock.mockResolvedValue({ success: false, questionNotFound: true });

        await deleteQuizQuestionController.deleteQuizQuestion(buildReq(), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_QUESTION_NOT_FOUND_MESSAGE
        });
    });

    it('returns 400 for an invalid question id', async () => {
        deleteMock.mockResolvedValue({ success: false, invalidQuestionId: true });

        await deleteQuizQuestionController.deleteQuizQuestion(buildReq('bad'), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });

    it('returns 500 when the service fails unexpectedly', async () => {
        deleteMock.mockResolvedValue({ success: false });

        await deleteQuizQuestionController.deleteQuizQuestion(buildReq(), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_DELETE_ERROR_MESSAGE
        });
    });

    it('returns 500 when the service throws', async () => {
        deleteMock.mockRejectedValue(new Error('boom'));

        await deleteQuizQuestionController.deleteQuizQuestion(buildReq(), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });
});
