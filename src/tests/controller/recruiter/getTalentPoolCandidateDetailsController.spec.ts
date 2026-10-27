import { Request, Response } from 'express';
import getTalentPoolCandidateDetailsController from '../../../controllers/recruiter/getTalentPoolCandidateDetailsController';
import getTalentPoolCandidateDetailsService from '../../../services/recruiter/getTalentPoolCandidateByIdService';
import { RECRUITER_ERROR_MESSAGES } from '../../../constants/recruiterErrorMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/recruiter/getTalentPoolCandidateByIdService', () => ({
    __esModule: true,
    default: { getTalentPoolCandidateDetails: jest.fn() }
}));

const getTalentPoolCandidateDetailsMock =
    getTalentPoolCandidateDetailsService.getTalentPoolCandidateDetails as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('getTalentPoolCandidateDetailsController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getTalentPoolCandidateDetailsMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the talent pool candidate details', async () => {
        const candidateDetails = { success: true, talentPoolCandidateDetails: { _id: 't1', candidateName: 'Alice' } };
        getTalentPoolCandidateDetailsMock.mockResolvedValue(candidateDetails);
        const req = { params: { id: 't1' } } as unknown as Request;

        await getTalentPoolCandidateDetailsController.getTalentPoolCandidateDetailsByRecruiter(req, res);
        await flushMicrotasks();

        expect(getTalentPoolCandidateDetailsMock).toHaveBeenCalledWith('t1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(candidateDetails);
    });

    it('returns 500 with the error message when the service rejects', async () => {
        getTalentPoolCandidateDetailsMock.mockRejectedValue(new Error('Service failure'));
        const req = { params: { id: 't1' } } as unknown as Request;

        await getTalentPoolCandidateDetailsController.getTalentPoolCandidateDetailsByRecruiter(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: RECRUITER_ERROR_MESSAGES.ERROR_FETCHING_POOL_CANDIDATE_DETAILS
        });
    });
});