import deletePoolCandidatesByAdminService from '../../../services/admin/deletePoolCandidatesByAdminService';
import TalentPoolCandidatesModel from '../../../model/talentPoolCandidatesModel';

jest.mock('../../../model/talentPoolCandidatesModel', () => {
    const TalentPoolCandidatesModel = jest.fn();
    (TalentPoolCandidatesModel as any).deleteOne = jest.fn();
    (TalentPoolCandidatesModel as any).updateOne = jest.fn();
    return { __esModule: true, default: TalentPoolCandidatesModel };
});

const TalentPoolCandidatesModelMock = TalentPoolCandidatesModel as unknown as jest.Mock & {
    deleteOne: jest.Mock;
    updateOne: jest.Mock;
};

describe('deletePoolCandidatesByAdminService', () => {
    beforeEach(() => {
        TalentPoolCandidatesModelMock.mockReset();
        TalentPoolCandidatesModelMock.deleteOne = jest.fn();
        TalentPoolCandidatesModelMock.updateOne = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('hard deletes a pool candidate and resolves { success: true }', async () => {
        TalentPoolCandidatesModelMock.deleteOne.mockResolvedValue({ deletedCount: 1 });

        const result = await deletePoolCandidatesByAdminService.hardDeletePoolCandidateByAdmin('c1');

        expect(TalentPoolCandidatesModelMock.deleteOne).toHaveBeenCalledWith({ _id: 'c1' });
        expect(result).toEqual({ success: true });
    });

    it('rejects { success: false } and logs when hard delete fails', async () => {
        TalentPoolCandidatesModelMock.deleteOne.mockRejectedValue(new Error('hard delete failed'));

        await expect(deletePoolCandidatesByAdminService.hardDeletePoolCandidateByAdmin('c1'))
            .rejects.toEqual({ success: false });
        expect(console.error).toHaveBeenCalled();
    });

    it('soft deletes a pool candidate and resolves { success: true }', async () => {
        TalentPoolCandidatesModelMock.updateOne.mockResolvedValue({ modifiedCount: 1 });

        const result = await deletePoolCandidatesByAdminService.softDeletePoolCandidateByAdmin('c1');

        expect(TalentPoolCandidatesModelMock.updateOne).toHaveBeenCalledWith({ _id: 'c1' }, { isDeleted: true });
        expect(result).toEqual({ success: true });
    });

    it('rejects { success: false } and logs when soft delete fails', async () => {
        TalentPoolCandidatesModelMock.updateOne.mockRejectedValue(new Error('soft delete failed'));

        await expect(deletePoolCandidatesByAdminService.softDeletePoolCandidateByAdmin('c1'))
            .rejects.toEqual({ success: false });
        expect(console.error).toHaveBeenCalled();
    });
});