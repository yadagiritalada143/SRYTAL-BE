import { Request, Response } from 'express';
import getAllTalentPoolCandidatesController from '../../../controllers/recruiter/getAllTalentPoolCandidatesController';
import getAllTalentPoolCandidatesService from '../../../services/recruiter/getAllTalentPoolCandidatesByRecruiterService';
import { RECRUITER_ERROR_MESSAGES } from '../../../constants/recruiterErrorMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/recruiter/getAllTalentPoolCandidatesByRecruiterService', () => ({
    __esModule: true,
    default: { getAllTalentPoolCandidates: jest.fn() }
}));

const getAllTalentPoolCandidatesMock =
    getAllTalentPoolCandidatesService.getAllTalentPoolCandidates as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('getAllTalentPoolCandidatesController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getAllTalentPoolCandidatesMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the talent pool candidates list', async () => {
        const candidatesList = { success: true, talentPoolCandidatesList: [{ _id: 't1', candidateName: 'Alice' }] };
        getAllTalentPoolCandidatesMock.mockResolvedValue(candidatesList);

        await getAllTalentPoolCandidatesController.getAllTalentPoolCandidatesByRecruiter({} as Request, res);
        await flushMicrotasks();

        expect(getAllTalentPoolCandidatesMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(candidatesList);
    });

    it('returns 500 with the error message when the service rejects', async () => {
        getAllTalentPoolCandidatesMock.mockRejectedValue(new Error('Service failure'));

        await getAllTalentPoolCandidatesController.getAllTalentPoolCandidatesByRecruiter({} as Request, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: RECRUITER_ERROR_MESSAGES.ERROR_FETCHING_POOL_CANDIDATE_DETAILS
        });
    });
});