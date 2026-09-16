import updatePoolCandidateService from '../../../services/recruiter/updatePoolCandidateByRecruiterService';
import TalentPoolCandidatesModel from '../../../model/talentPoolCandidatesModel';

jest.mock('../../../model/talentPoolCandidatesModel', () => ({
    __esModule: true,
    default: { updateOne: jest.fn() }
}));

const updateOneMock = (TalentPoolCandidatesModel as unknown as { updateOne: jest.Mock }).updateOne;

describe('updatePoolCandidateByRecruiterService', () => {
    beforeEach(() => {
        updateOneMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns { success: true } when the candidate update is acknowledged', async () => {
        updateOneMock.mockResolvedValue({ acknowledged: true });

        const result = await updatePoolCandidateService.updatePoolCandidateDetails({
            id: 't1',
            candidateName: 'Alice'
        });

        expect(updateOneMock).toHaveBeenCalledWith(
            { _id: 't1' },
            { id: 't1', candidateName: 'Alice', lastUpdatedAt: expect.any(Date) }
        );
        expect(result).toEqual({ success: true });
    });

    it('returns { success: false } when the candidate update is not acknowledged', async () => {
        updateOneMock.mockResolvedValue({ acknowledged: false });

        const result = await updatePoolCandidateService.updatePoolCandidateDetails({
            id: 't1',
            candidateName: 'Alice'
        });

        expect(result).toEqual({ success: false });
    });

    it('returns { success: false } when the update throws', async () => {
        updateOneMock.mockRejectedValue(new Error('Update failed'));

        const result = await updatePoolCandidateService.updatePoolCandidateDetails({
            id: 't1',
            candidateName: 'Alice'
        });

        expect(result).toEqual({ success: false });
    });
});