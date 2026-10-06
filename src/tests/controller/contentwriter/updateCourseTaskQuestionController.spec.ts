import { Request, Response } from 'express';
import updateCourseTaskQuestionController from '../../../controllers/contentwriter/updateCourseTaskQuestionController';
import updateCourseTaskQuestionService from '../../../services/contentwriter/updateCourseTaskQuestionService';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/contentwriter/updateCourseTaskQuestionService', () => ({
    __esModule: true,
    default: { updateCourseTaskQuestion: jest.fn() }
}));

const updateCourseTaskQuestionMock =
    updateCourseTaskQuestionService.updateCourseTaskQuestion as jest.Mock;

describe('updateCourseTaskQuestionController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updateCourseTaskQuestionMock.mockReset();
    });

    const buildReq = (body: Record<string, unknown> = {}) =>
        ({ body } as Request);

    it('passes the request body fields to the update service', async () => {
        const body = {
            taskId: '64f123456789abcdef123456',
            questionId: '64f123456789abcdef123999',
            question: 'Updated question',
            description: 'Updated description',
            status: 'ARCHIVE'
        };
        updateCourseTaskQuestionMock.mockResolvedValue({
            success: true,
            taskId: body.taskId,
            questionId: body.questionId
        });

        await updateCourseTaskQuestionController.updateCourseTaskQuestion(
            buildReq(body),
            res
        );

        expect(updateCourseTaskQuestionMock).toHaveBeenCalledWith(body);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            taskId: body.taskId,
            questionId: body.questionId
        }));
    });

    it('returns 400 when a required id is missing', async () => {
        await updateCourseTaskQuestionController.updateCourseTaskQuestion(
            buildReq({ taskId: '64f123456789abcdef123456' }),
            res
        );

        expect(updateCourseTaskQuestionMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });
});
