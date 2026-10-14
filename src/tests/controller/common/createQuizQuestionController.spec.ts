import { Request, Response } from 'express';
import createQuizQuestionController from '../../../controllers/contentwriter/createQuizQuestionController';
import createQuizQuestionService from '../../../services/contentwriter/createQuizQuestionService';
import {
    COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES,
    COURSE_QUIZ_QUESTION_ERROR_MESSAGES,
} from '../../../constants/contentwriter/courseQuizQuestionMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/contentwriter/createQuizQuestionService', () => ({
    __esModule: true,
    default: { createQuizQuestion: jest.fn() }
}));

const createQuizQuestionMock = createQuizQuestionService.createQuizQuestion as unknown as jest.Mock;

describe('createQuizQuestionController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        createQuizQuestionMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const buildReq = (body: Record<string, unknown>) => ({ body } as unknown as Request);

    it('creates a RADIO question and returns 201', async () => {
        const options = [
            { value: 'A', isanswer: false },
            { value: 'B', isanswer: true },
            { value: 'C', isanswer: false },
            { value: 'D', isanswer: false }
        ];
        createQuizQuestionMock.mockResolvedValue({ success: true, question: { _id: 'q1' } });

        await createQuizQuestionController.createQuizQuestion(
            buildReq({ taskId: 't1', question: 'Question?', type: 'RADIO', options, status: 'SHOW' }),
            res
        );

        expect(createQuizQuestionMock).toHaveBeenCalledWith('t1', 'Question?', 'RADIO', options, 'SHOW');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES.COURSE_QUIZ_QUESTION_ADD_SUCCESS_MESSAGE,
            data: { _id: 'q1' }
        });
    });

    it('defaults status to SHOW when omitted', async () => {
        createQuizQuestionMock.mockResolvedValue({ success: true, question: { _id: 'q1' } });

        await createQuizQuestionController.createQuizQuestion(
            buildReq({ taskId: 't1', question: 'Q?', type: 'TEXTAREA', status: undefined }),
            res
        );

        expect(createQuizQuestionMock).toHaveBeenCalledWith('t1', 'Q?', 'TEXTAREA', undefined, 'SHOW');
    });

    it('rejects a RADIO question with fewer than four options', async () => {
        await createQuizQuestionController.createQuizQuestion(
            buildReq({
                taskId: 't1', question: 'Q?', type: 'RADIO',
                options: [{ value: 'A', isanswer: true }, { value: 'B' }, { value: 'C' }]
            }),
            res
        );

        expect(createQuizQuestionMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_MIN_OPTIONS_MESSAGE
        });
    });

    it('rejects a RADIO question without exactly one correct answer', async () => {
        await createQuizQuestionController.createQuizQuestion(
            buildReq({
                taskId: 't1', question: 'Q?', type: 'RADIO',
                options: [
                    { value: 'A', isanswer: true },
                    { value: 'B', isanswer: true },
                    { value: 'C' },
                    { value: 'D' }
                ]
            }),
            res
        );

        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_SINGLE_ANSWER_MESSAGE
        });
    });

    it('rejects a CHECKBOX question with no correct answer', async () => {
        await createQuizQuestionController.createQuizQuestion(
            buildReq({
                taskId: 't1', question: 'Q?', type: 'CHECKBOX',
                options: [{ value: 'A' }, { value: 'B' }, { value: 'C' }, { value: 'D' }]
            }),
            res
        );

        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_MIN_ANSWER_MESSAGE
        });
    });

    it('rejects a TOGGLE question that does not have exactly two options', async () => {
        await createQuizQuestionController.createQuizQuestion(
            buildReq({
                taskId: 't1', question: 'Q?', type: 'TOGGLE',
                options: [{ value: 'A', isanswer: true }, { value: 'B' }, { value: 'C' }]
            }),
            res
        );

        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_TOGGLE_OPTIONS_MESSAGE
        });
    });

    it('allows a TEXTAREA question without options', async () => {
        createQuizQuestionMock.mockResolvedValue({ success: true, question: { _id: 'q2' } });

        await createQuizQuestionController.createQuizQuestion(
            buildReq({ taskId: 't1', question: 'Explain?', type: 'TEXTAREA' }),
            res
        );

        expect(createQuizQuestionMock).toHaveBeenCalledWith('t1', 'Explain?', 'TEXTAREA', undefined, 'SHOW');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
    });

    it('returns 404 when the task is not found', async () => {
        createQuizQuestionMock.mockResolvedValue({ success: false, taskNotFound: true });

        await createQuizQuestionController.createQuizQuestion(
            buildReq({ taskId: 'missing', question: 'Q?', type: 'TEXTAREA' }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_TASK_NOT_FOUND_MESSAGE
        });
    });

    it('returns 400 when the task is not a QUIZ task', async () => {
        createQuizQuestionMock.mockResolvedValue({ success: false, notQuizTask: true });

        await createQuizQuestionController.createQuizQuestion(
            buildReq({ taskId: 't1', question: 'Q?', type: 'TEXTAREA' }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_NOT_QUIZ_TASK_MESSAGE
        });
    });

    it('returns 409 when the question is a duplicate in the same task', async () => {
        createQuizQuestionMock.mockResolvedValue({ success: false, duplicateQuestion: true });

        await createQuizQuestionController.createQuizQuestion(
            buildReq({ taskId: 't1', question: 'Q?', type: 'TEXTAREA' }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CONFLICT);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_DUPLICATE_MESSAGE
        });
    });

    it('returns 500 when the service throws', async () => {
        createQuizQuestionMock.mockRejectedValue(new Error('failure'));

        await createQuizQuestionController.createQuizQuestion(
            buildReq({ taskId: 't1', question: 'Q?', type: 'TEXTAREA' }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_ADD_ERROR_MESSAGE
        });
    });
});
