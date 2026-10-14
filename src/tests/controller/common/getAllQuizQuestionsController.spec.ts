import { Request, Response } from 'express';
import getAllQuizQuestionsController from '../../../controllers/contentwriter/getAllQuizQuestionsController';
import getAllQuizQuestionsService from '../../../services/contentwriter/getAllQuizQuestionsService';
import {
    COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES,
    COURSE_QUIZ_QUESTION_ERROR_MESSAGES,
} from '../../../constants/contentwriter/courseQuizQuestionMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/contentwriter/getAllQuizQuestionsService', () => ({
    __esModule: true,
    default: { getAllQuizQuestions: jest.fn() }
}));

const getAllQuizQuestionsMock = getAllQuizQuestionsService.getAllQuizQuestions as unknown as jest.Mock;

describe('getAllQuizQuestionsController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getAllQuizQuestionsMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const buildReq = (taskId: string) => ({ params: { taskId } } as unknown as Request);

    it('returns 400 for an invalid taskId without calling the service', async () => {
        await getAllQuizQuestionsController.getAllQuizQuestions(buildReq('not-an-id'), res);

        expect(getAllQuizQuestionsMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_INVALID_TASK_ID_MESSAGE
        });
    });

    it('returns 200 with the questions', async () => {
        const questions = [{ _id: 'q1' }, { _id: 'q2' }];
        getAllQuizQuestionsMock.mockResolvedValue({ success: true, questions });

        await getAllQuizQuestionsController.getAllQuizQuestions(buildReq('66d323456789abcdef123456'), res);

        expect(getAllQuizQuestionsMock).toHaveBeenCalledWith('66d323456789abcdef123456');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES.COURSE_QUIZ_QUESTION_FETCH_SUCCESS_MESSAGE,
            data: questions
        });
    });

    it('returns 404 when the task is not found', async () => {
        getAllQuizQuestionsMock.mockResolvedValue({ success: false, taskNotFound: true });

        await getAllQuizQuestionsController.getAllQuizQuestions(buildReq('66d323456789abcdef123456'), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_TASK_NOT_FOUND_MESSAGE
        });
    });

    it('returns 400 when the task is not a QUIZ task', async () => {
        getAllQuizQuestionsMock.mockResolvedValue({ success: false, notQuizTask: true });

        await getAllQuizQuestionsController.getAllQuizQuestions(buildReq('66d323456789abcdef123456'), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_NOT_QUIZ_TASK_MESSAGE
        });
    });

    it('returns 500 when the service throws', async () => {
        getAllQuizQuestionsMock.mockRejectedValue(new Error('failure'));

        await getAllQuizQuestionsController.getAllQuizQuestions(buildReq('66d323456789abcdef123456'), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_FETCH_ERROR_MESSAGE
        });
    });
});
