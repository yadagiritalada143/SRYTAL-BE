import { Request, Response } from 'express';
import addCommentToPoolCandidateController from '../../../controllers/recruiter/addCommentToPoolCandidateByRecruiterController';
import addCommentToPoolCandidateService from '../../../services/recruiter/addCommentToPoolCandidateByRecruiterService';
import { RECRUITER_ERROR_MESSAGES } from '../../../constants/recruiterErrorMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/recruiter/addCommentToPoolCandidateByRecruiterService', () => ({
    __esModule: true,
    default: { addCommentToPoolCandidateByRecruiter: jest.fn() }
}));

const addCommentToPoolCandidateMock =
    addCommentToPoolCandidateService.addCommentToPoolCandidateByRecruiter as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('addCommentToPoolCandidateByRecruiterController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        addCommentToPoolCandidateMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('adds a comment to the pool candidate and returns 200 with the response', async () => {
        const req = {
            body: { id: 't1', comment: 'Scheduled' },
            user: { userId: 'u1' }
        } as unknown as Request;
        const responseAfterCommentAdded = { _id: 't1', comments: [] };
        addCommentToPoolCandidateMock.mockResolvedValue(responseAfterCommentAdded);

        await addCommentToPoolCandidateController.addCommentToPoolCandidateByRecruiter(req, res);
        await flushMicrotasks();

        expect(addCommentToPoolCandidateMock).toHaveBeenCalledWith({ id: 't1', comment: 'Scheduled', userId: 'u1' });
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ responseAfterCommentAdded });
    });

    it('passes undefined as the userId when the request has no user', async () => {
        const req = { body: { id: 't1', comment: 'Scheduled' } } as unknown as Request;
        addCommentToPoolCandidateMock.mockResolvedValue({ _id: 't1', comments: [] });

        await addCommentToPoolCandidateController.addCommentToPoolCandidateByRecruiter(req, res);
        await flushMicrotasks();

        expect(addCommentToPoolCandidateMock).toHaveBeenCalledWith({
            id: 't1',
            comment: 'Scheduled',
            userId: undefined
        });
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = {
            body: { id: 't1', comment: 'Scheduled' },
            user: { userId: 'u1' }
        } as unknown as Request;
        addCommentToPoolCandidateMock.mockRejectedValue(new Error('Service failure'));

        await addCommentToPoolCandidateController.addCommentToPoolCandidateByRecruiter(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: RECRUITER_ERROR_MESSAGES.ERROR_ADDING_COMMENT_TO_POOL_CANDIDATE
        });
    });
});