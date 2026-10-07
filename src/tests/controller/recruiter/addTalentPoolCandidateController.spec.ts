import { Request, Response } from 'express';
import addTalentPoolCandidateController from '../../../controllers/recruiter/addTalentPoolCandidateController';
import addTalentPoolCandidateService from '../../../services/recruiter/addTalentPoolCandidateByRecruiterService';
import { RECRUITER_ERROR_MESSAGES } from '../../../constants/recruiterErrorMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/recruiter/addTalentPoolCandidateByRecruiterService', () => ({
    __esModule: true,
    default: { addTalentPoolCandidatesByRecruiter: jest.fn() }
}));

const addTalentPoolCandidatesMock =
    addTalentPoolCandidateService.addTalentPoolCandidatesByRecruiter as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('addTalentPoolCandidateController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        addTalentPoolCandidatesMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('adds a candidate without comments and returns 200 with the added candidate response', async () => {
        const req = {
            body: { candidateName: 'Alice' },
            user: { userId: 'u1' }
        } as unknown as Request;
        const addedCandidate = { _id: 't1', candidateName: 'Alice' };
        addTalentPoolCandidatesMock.mockResolvedValue(addedCandidate);

        await addTalentPoolCandidateController.addTalentPoolCandidateByRecruiter(req, res);
        await flushMicrotasks();

        expect(addTalentPoolCandidatesMock).toHaveBeenCalledWith(
            expect.objectContaining({
                candidateName: 'Alice',
                createdAt: expect.any(Date),
                lastUpdatedAt: expect.any(Date),
                createdBy: 'u1'
            })
        );
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ responseAfterCandidateAdded: addedCandidate });
    });

    it('adds a candidate with comments mapped to the current user and returns 200', async () => {
        const req = {
            body: { candidateName: 'Alice', comments: [{ comment: 'Initial review' }] },
            user: { userId: 'u1' }
        } as unknown as Request;
        addTalentPoolCandidatesMock.mockResolvedValue({ _id: 't1' });

        await addTalentPoolCandidateController.addTalentPoolCandidateByRecruiter(req, res);
        await flushMicrotasks();

        expect(addTalentPoolCandidatesMock).toHaveBeenCalledWith(
            expect.objectContaining({
                candidateName: 'Alice',
                createdAt: expect.any(Date),
                lastUpdatedAt: expect.any(Date),
                createdBy: 'u1',
                comments: [{ comment: 'Initial review', userId: 'u1', updatedAt: expect.any(Date) }]
            })
        );
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ responseAfterCandidateAdded: { _id: 't1' } });
    });

    it('adds a candidate with an empty comments array without remapping the comments', async () => {
        const req = {
            body: { candidateName: 'Alice', comments: [] },
            user: { userId: 'u1' }
        } as unknown as Request;
        addTalentPoolCandidatesMock.mockResolvedValue({ _id: 't1' });

        await addTalentPoolCandidateController.addTalentPoolCandidateByRecruiter(req, res);
        await flushMicrotasks();

        expect(addTalentPoolCandidatesMock).toHaveBeenCalledWith(
            expect.objectContaining({
                candidateName: 'Alice',
                createdBy: 'u1',
                comments: []
            })
        );
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });

    it('leaves createdBy undefined when the request has no user', async () => {
        const req = { body: { candidateName: 'Alice' } } as unknown as Request;
        addTalentPoolCandidatesMock.mockResolvedValue({ _id: 't1' });

        await addTalentPoolCandidateController.addTalentPoolCandidateByRecruiter(req, res);
        await flushMicrotasks();

        expect(addTalentPoolCandidatesMock).toHaveBeenCalledWith(
            expect.objectContaining({
                candidateName: 'Alice',
                createdBy: undefined
            })
        );
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ responseAfterCandidateAdded: { _id: 't1' } });
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = {
            body: { candidateName: 'Alice' },
            user: { userId: 'u1' }
        } as unknown as Request;
        addTalentPoolCandidatesMock.mockRejectedValue(new Error('Service failure'));

        await addTalentPoolCandidateController.addTalentPoolCandidateByRecruiter(req, res);
        await flushMicrotasks();

        expect(addTalentPoolCandidatesMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: RECRUITER_ERROR_MESSAGES.ERROR_ADDING_POOL_CANDIDATE_DETAILS
        });
    });
});