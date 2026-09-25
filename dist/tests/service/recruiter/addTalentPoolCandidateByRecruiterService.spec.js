"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addTalentPoolCandidateByRecruiterService_1 = __importDefault(require("../../../services/recruiter/addTalentPoolCandidateByRecruiterService"));
const talentPoolCandidatesModel_1 = __importDefault(require("../../../model/talentPoolCandidatesModel"));
jest.mock('../../../model/talentPoolCandidatesModel', () => {
    const TalentPoolCandidatesModel = jest.fn();
    return { __esModule: true, default: TalentPoolCandidatesModel };
});
const TalentPoolCandidatesModelMock = talentPoolCandidatesModel_1.default;
describe('addTalentPoolCandidateByRecruiterService', () => {
    let saveSpy;
    beforeEach(() => {
        TalentPoolCandidatesModelMock.mockReset();
        saveSpy = jest.fn();
        TalentPoolCandidatesModelMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('creates a candidate document with the given details and saves it successfully', async () => {
        const details = { candidateName: 'Alice', contact: { email: 'alice@example.com' } };
        const savedCandidate = Object.assign({ _id: 't1' }, details);
        saveSpy.mockResolvedValue(savedCandidate);
        const result = await addTalentPoolCandidateByRecruiterService_1.default.addTalentPoolCandidatesByRecruiter(details);
        expect(TalentPoolCandidatesModelMock).toHaveBeenCalledTimes(1);
        expect(TalentPoolCandidatesModelMock).toHaveBeenCalledWith(details);
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(savedCandidate);
    });
    it('returns { success: false } when saving throws', async () => {
        saveSpy.mockRejectedValue(new Error('Save failed'));
        const result = await addTalentPoolCandidateByRecruiterService_1.default.addTalentPoolCandidatesByRecruiter({
            candidateName: 'Alice'
        });
        expect(TalentPoolCandidatesModelMock).toHaveBeenCalledTimes(1);
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });
});
