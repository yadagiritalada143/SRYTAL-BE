import { Request, Response } from 'express';
import updatePoolCandidateController from '../../../controllers/recruiter/updatePoolCandidateByRecruiterController';
import updatePoolCandidateService from '../../../services/recruiter/updatePoolCandidateByRecruiterService';
import { RECRUITER_ERROR_MESSAGES } from '../../../constants/recruiterErrorMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/recruiter/updatePoolCandidateByRecruiterService', () => ({
    __esModule: true,
    default: { updatePoolCandidateDetails: jest.fn() }
}));

const updatePoolCandidateDetailsMock = updatePoolCandidateService.updatePoolCandidateDetails as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('updatePoolCandidateByRecruiterController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updatePoolCandidateDetailsMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('updates the pool candidate successfully and returns 200 with a success flag', async () => {
        const req = { body: { id: 't1', candidateName: 'Alice' } } as unknown as Request;
        updatePoolCandidateDetailsMock.mockResolvedValue({ success: true });

        await updatePoolCandidateController.updatePoolCandidateByRecruiter(req, res);
        await flushMicrotasks();

        expect(updatePoolCandidateDetailsMock).toHaveBeenCalledWith({ id: 't1', candidateName: 'Alice' });
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true });
    });

    it('returns 401 with the error message when the update is not successful', async () => {
        const req = { body: { id: 't1', candidateName: 'Alice' } } as unknown as Request;
        updatePoolCandidateDetailsMock.mockResolvedValue({ success: false });

        await updatePoolCandidateController.updatePoolCandidateByRecruiter(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: RECRUITER_ERROR_MESSAGES.ERROR_UPDATING_POOL_CANDIDATE_DETAILS
        });
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = { body: { id: 't1', candidateName: 'Alice' } } as unknown as Request;
        updatePoolCandidateDetailsMock.mockRejectedValue(new Error('Service failure'));

        await updatePoolCandidateController.updatePoolCandidateByRecruiter(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: RECRUITER_ERROR_MESSAGES.ERROR_UPDATING_POOL_CANDIDATE_DETAILS
        });
    });
});