import { Request, Response } from 'express';
import updateQuizQuestionController from '../../../controllers/contentwriter/updateQuizQuestionController';
import updateQuizQuestionService from '../../../services/contentwriter/updateQuizQuestionService';
import {
    COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES,
    COURSE_QUIZ_QUESTION_ERROR_MESSAGES,
} from '../../../constants/contentwriter/courseQuizQuestionMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/contentwriter/updateQuizQuestionService');

describe('updateQuizQuestionController', () => {
    let mockStatus: jest.Mock;
    let mockJson: jest.Mock;
    let res: Response;
    const updateMock = updateQuizQuestionService.updateQuizQuestion as jest.Mock;

    const validId = '66d323456789abcdef123456';

    const buildReq = (body: any, questionId = validId) =>
        ({ params: { questionId }, body } as unknown as Request);

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

    it('returns 400 when the body fails schema validation', async () => {
        await updateQuizQuestionController.updateQuizQuestion(buildReq({ status: 'NOPE' }), res);

        expect(updateMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });

    it('returns 200 with the updated question', async () => {
        const question = { _id: validId, question: 'New?' };
        updateMock.mockResolvedValue({ success: true, question });

        await updateQuizQuestionController.updateQuizQuestion(buildReq({ question: 'New?' }), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES.COURSE_QUIZ_QUESTION_UPDATE_SUCCESS_MESSAGE,
            data: question
        });
    });

    it('returns 404 when the question is not found', async () => {
        updateMock.mockResolvedValue({ success: false, questionNotFound: true });

        await updateQuizQuestionController.updateQuizQuestion(buildReq({ question: 'New?' }), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_QUESTION_NOT_FOUND_MESSAGE
        });
    });

    it('returns 400 when the options are invalid', async () => {
        updateMock.mockResolvedValue({ success: false, invalidOptions: true, message: 'bad options' });

        await updateQuizQuestionController.updateQuizQuestion(buildReq({ options: [] }), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: 'bad options' });
    });

    it('returns 409 when the question text is a duplicate', async () => {
        updateMock.mockResolvedValue({ success: false, duplicateQuestion: true });

        await updateQuizQuestionController.updateQuizQuestion(buildReq({ question: 'Taken?' }), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CONFLICT);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_DUPLICATE_MESSAGE
        });
    });

    it('returns 500 when the service fails unexpectedly', async () => {
        updateMock.mockResolvedValue({ success: false });

        await updateQuizQuestionController.updateQuizQuestion(buildReq({ question: 'New?' }), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_UPDATE_ERROR_MESSAGE
        });
    });

    it('returns 500 when the service throws', async () => {
        updateMock.mockRejectedValue(new Error('boom'));

        await updateQuizQuestionController.updateQuizQuestion(buildReq({ question: 'New?' }), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });
});
