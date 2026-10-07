import addTalentPoolCandidateService from '../../../services/recruiter/addTalentPoolCandidateByRecruiterService';
import TalentPoolCandidatesModel from '../../../model/talentPoolCandidatesModel';

jest.mock('../../../model/talentPoolCandidatesModel', () => {
    const TalentPoolCandidatesModel = jest.fn();
    return { __esModule: true, default: TalentPoolCandidatesModel };
});

const TalentPoolCandidatesModelMock = TalentPoolCandidatesModel as unknown as jest.Mock;

describe('addTalentPoolCandidateByRecruiterService', () => {
    let saveSpy: jest.Mock;

    beforeEach(() => {
        TalentPoolCandidatesModelMock.mockReset();
        saveSpy = jest.fn();
        TalentPoolCandidatesModelMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('creates a candidate document with the given details and saves it successfully', async () => {
        const details = { candidateName: 'Alice', contact: { email: 'alice@example.com' } };
        const savedCandidate = { _id: 't1', ...details };
        saveSpy.mockResolvedValue(savedCandidate);

        const result = await addTalentPoolCandidateService.addTalentPoolCandidatesByRecruiter(details);

        expect(TalentPoolCandidatesModelMock).toHaveBeenCalledTimes(1);
        expect(TalentPoolCandidatesModelMock).toHaveBeenCalledWith(details);
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(savedCandidate);
    });

    it('returns { success: false } when saving throws', async () => {
        saveSpy.mockRejectedValue(new Error('Save failed'));

        const result = await addTalentPoolCandidateService.addTalentPoolCandidatesByRecruiter({
            candidateName: 'Alice'
        });

        expect(TalentPoolCandidatesModelMock).toHaveBeenCalledTimes(1);
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });
});