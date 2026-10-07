"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updatePoolCandidateByRecruiterService_1 = __importDefault(require("../../../services/recruiter/updatePoolCandidateByRecruiterService"));
const talentPoolCandidatesModel_1 = __importDefault(require("../../../model/talentPoolCandidatesModel"));
jest.mock('../../../model/talentPoolCandidatesModel', () => ({
    __esModule: true,
    default: { updateOne: jest.fn() }
}));
const updateOneMock = talentPoolCandidatesModel_1.default.updateOne;
describe('updatePoolCandidateByRecruiterService', () => {
    beforeEach(() => {
        updateOneMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns { success: true } when the candidate update is acknowledged', async () => {
        updateOneMock.mockResolvedValue({ acknowledged: true });
        const result = await updatePoolCandidateByRecruiterService_1.default.updatePoolCandidateDetails({
            id: 't1',
            candidateName: 'Alice'
        });
        expect(updateOneMock).toHaveBeenCalledWith({ _id: 't1' }, { id: 't1', candidateName: 'Alice', lastUpdatedAt: expect.any(Date) });
        expect(result).toEqual({ success: true });
    });
    it('returns { success: false } when the candidate update is not acknowledged', async () => {
        updateOneMock.mockResolvedValue({ acknowledged: false });
        const result = await updatePoolCandidateByRecruiterService_1.default.updatePoolCandidateDetails({
            id: 't1',
            candidateName: 'Alice'
        });
        expect(result).toEqual({ success: false });
    });
    it('returns { success: false } when the update throws', async () => {
        updateOneMock.mockRejectedValue(new Error('Update failed'));
        const result = await updatePoolCandidateByRecruiterService_1.default.updatePoolCandidateDetails({
            id: 't1',
            candidateName: 'Alice'
        });
        expect(result).toEqual({ success: false });
    });
});
