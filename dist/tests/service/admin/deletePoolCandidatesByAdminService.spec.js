"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deletePoolCandidatesByAdminService_1 = __importDefault(require("../../../services/admin/deletePoolCandidatesByAdminService"));
const talentPoolCandidatesModel_1 = __importDefault(require("../../../model/talentPoolCandidatesModel"));
jest.mock('../../../model/talentPoolCandidatesModel', () => {
    const TalentPoolCandidatesModel = jest.fn();
    TalentPoolCandidatesModel.deleteOne = jest.fn();
    TalentPoolCandidatesModel.updateOne = jest.fn();
    return { __esModule: true, default: TalentPoolCandidatesModel };
});
const TalentPoolCandidatesModelMock = talentPoolCandidatesModel_1.default;
describe('deletePoolCandidatesByAdminService', () => {
    beforeEach(() => {
        TalentPoolCandidatesModelMock.mockReset();
        TalentPoolCandidatesModelMock.deleteOne = jest.fn();
        TalentPoolCandidatesModelMock.updateOne = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('hard deletes a pool candidate and resolves { success: true }', async () => {
        TalentPoolCandidatesModelMock.deleteOne.mockResolvedValue({ deletedCount: 1 });
        const result = await deletePoolCandidatesByAdminService_1.default.hardDeletePoolCandidateByAdmin('c1');
        expect(TalentPoolCandidatesModelMock.deleteOne).toHaveBeenCalledWith({ _id: 'c1' });
        expect(result).toEqual({ success: true });
    });
    it('rejects { success: false } and logs when hard delete fails', async () => {
        TalentPoolCandidatesModelMock.deleteOne.mockRejectedValue(new Error('hard delete failed'));
        await expect(deletePoolCandidatesByAdminService_1.default.hardDeletePoolCandidateByAdmin('c1'))
            .rejects.toEqual({ success: false });
        expect(console.error).toHaveBeenCalled();
    });
    it('soft deletes a pool candidate and resolves { success: true }', async () => {
        TalentPoolCandidatesModelMock.updateOne.mockResolvedValue({ modifiedCount: 1 });
        const result = await deletePoolCandidatesByAdminService_1.default.softDeletePoolCandidateByAdmin('c1');
        expect(TalentPoolCandidatesModelMock.updateOne).toHaveBeenCalledWith({ _id: 'c1' }, { isDeleted: true });
        expect(result).toEqual({ success: true });
    });
    it('rejects { success: false } and logs when soft delete fails', async () => {
        TalentPoolCandidatesModelMock.updateOne.mockRejectedValue(new Error('soft delete failed'));
        await expect(deletePoolCandidatesByAdminService_1.default.softDeletePoolCandidateByAdmin('c1'))
            .rejects.toEqual({ success: false });
        expect(console.error).toHaveBeenCalled();
    });
});
