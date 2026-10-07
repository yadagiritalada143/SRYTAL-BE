import { Request, Response } from 'express';
import getQuestionController from '../../../controllers/common/getCodingTaskController';
import getQuestionService from '../../../services/common/getCodingTaskService';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';
import { CODING_QUESTION_ERROR_MESSAGES } from '../../../constants/common/codingQuestionMessages';

jest.mock('../../../services/common/getQuestionService', () => ({
    __esModule: true,
    default: { getQuestion: jest.fn() }
}));

const getQuestionMock = getQuestionService.getQuestion as jest.Mock;

describe('getQuestionController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getQuestionMock.mockReset();
    });

    const buildReq = () => ({
        params: {
            taskid: '64f123456789abcdef123456',
            questionid: '64f123456789abcdef123999',
            languageid: '64f123456789abcdef123888'
        },
        user: { userId: '64f123456789abcdef123333' }
    } as unknown as Request);

    it('returns a clear forbidden response when the employee is not assigned', async () => {
        getQuestionMock.mockResolvedValue({
            success: false,
            notAssigned: true
        });

        await getQuestionController.getQuestion(buildReq(), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: CODING_QUESTION_ERROR_MESSAGES.QUESTION_NOT_ASSIGNED_MESSAGE
        });
    });

    it('returns the question and starter code without boilerplate status fields', async () => {
        const data = {
            question: 'Reverse a string',
            starterCode: 'function reverse(value) {}'
        };
        getQuestionMock.mockResolvedValue({ success: true, data });

        await getQuestionController.getQuestion(buildReq(), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            data
        }));
    });
});
