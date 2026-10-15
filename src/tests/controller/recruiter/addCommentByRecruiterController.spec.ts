import { Request, Response } from 'express';
import addCommentByRecruiterController from '../../../controllers/recruiter/addCommentByRecruiterController';
import addCommentByRecruiterService from '../../../services/recruiter/addCommentByRecruiterService';
import { RECRUITER_ERROR_MESSAGES } from '../../../constants/recruiterErrorMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/recruiter/addCommentByRecruiterService', () => ({
    __esModule: true,
    default: { addCommentByRecruiter: jest.fn() }
}));

const addCommentByRecruiterMock = addCommentByRecruiterService.addCommentByRecruiter as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('addCommentByRecruiterController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        addCommentByRecruiterMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('adds a comment and returns 200 with the response after sorting existing comments', async () => {
        const req = {
            body: { id: 'c1', comment: 'Great' },
            user: { userId: 'u1' }
        } as unknown as Request;
        const responseAfterCommentAdded = {
            _id: 'c1',
            comments: [
                { comment: 'older', updateAt: new Date('2024-01-01T00:00:00Z') },
                { comment: 'newer', updateAt: new Date('2024-02-01T00:00:00Z') }
            ]
        };
        addCommentByRecruiterMock.mockResolvedValue(responseAfterCommentAdded);

        await addCommentByRecruiterController.addCommentByRecruiter(req, res);
        await flushMicrotasks();

        expect(addCommentByRecruiterMock).toHaveBeenCalledWith({ id: 'c1', comment: 'Great', userId: 'u1' });
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ responseAfterCommentAdded });
        expect(responseAfterCommentAdded.comments[0].comment).toBe('newer');
    });

    it('returns 200 when the response has no comments', async () => {
        const req = {
            body: { id: 'c1', comment: 'Great' },
            user: { userId: 'u1' }
        } as unknown as Request;
        const responseAfterCommentAdded = { _id: 'c1' };
        addCommentByRecruiterMock.mockResolvedValue(responseAfterCommentAdded);

        await addCommentByRecruiterController.addCommentByRecruiter(req, res);
        await flushMicrotasks();

        expect(addCommentByRecruiterMock).toHaveBeenCalledWith({ id: 'c1', comment: 'Great', userId: 'u1' });
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ responseAfterCommentAdded });
    });

    it('passes undefined as the userId when the request has no user', async () => {
        const req = { body: { id: 'c1', comment: 'Great' } } as unknown as Request;
        addCommentByRecruiterMock.mockResolvedValue({ _id: 'c1' });

        await addCommentByRecruiterController.addCommentByRecruiter(req, res);
        await flushMicrotasks();

        expect(addCommentByRecruiterMock).toHaveBeenCalledWith({ id: 'c1', comment: 'Great', userId: undefined });
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = {
            body: { id: 'c1', comment: 'Great' },
            user: { userId: 'u1' }
        } as unknown as Request;
        addCommentByRecruiterMock.mockRejectedValue(new Error('Service failure'));

        await addCommentByRecruiterController.addCommentByRecruiter(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: RECRUITER_ERROR_MESSAGES.ERROR_ADDING_COMMENT
        });
    });
});