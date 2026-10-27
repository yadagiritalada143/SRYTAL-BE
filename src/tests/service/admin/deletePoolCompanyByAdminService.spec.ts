import deletePoolCompanyByAdminService from '../../../services/admin/deletePoolCompanyByAdminService';
import PoolCompaniesModel from '../../../model/poolCompanies';

jest.mock('../../../model/poolCompanies', () => {
    const PoolCompaniesModel = jest.fn();
    (PoolCompaniesModel as any).deleteOne = jest.fn();
    (PoolCompaniesModel as any).updateOne = jest.fn();
    return { __esModule: true, default: PoolCompaniesModel };
});

const PoolCompaniesModelMock = PoolCompaniesModel as unknown as jest.Mock & {
    deleteOne: jest.Mock;
    updateOne: jest.Mock;
};

describe('deletePoolCompanyByAdminService', () => {
    beforeEach(() => {
        PoolCompaniesModelMock.mockReset();
        PoolCompaniesModelMock.deleteOne = jest.fn();
        PoolCompaniesModelMock.updateOne = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('hard deletes a pool company and resolves { success: true }', async () => {
        PoolCompaniesModelMock.deleteOne.mockResolvedValue({ deletedCount: 1 });

        const result = await deletePoolCompanyByAdminService.hardDeletePoolCompanyByAdmin('co1');

        expect(PoolCompaniesModelMock.deleteOne).toHaveBeenCalledWith({ _id: 'co1' });
        expect(result).toEqual({ success: true });
    });

    it('rejects { success: false } and logs when hard delete fails', async () => {
        PoolCompaniesModelMock.deleteOne.mockRejectedValue(new Error('hard delete failed'));

        await expect(deletePoolCompanyByAdminService.hardDeletePoolCompanyByAdmin('co1'))
            .rejects.toEqual({ success: false });
        expect(console.error).toHaveBeenCalled();
    });

    it('soft deletes a pool company and resolves { success: true }', async () => {
        PoolCompaniesModelMock.updateOne.mockResolvedValue({ modifiedCount: 1 });

        const result = await deletePoolCompanyByAdminService.softDeletePoolCompanyByAdmin('co1');

        expect(PoolCompaniesModelMock.updateOne).toHaveBeenCalledWith({ _id: 'co1' }, { isDeleted: true });
        expect(result).toEqual({ success: true });
    });

    it('rejects { success: false } and logs when soft delete fails', async () => {
        PoolCompaniesModelMock.updateOne.mockRejectedValue(new Error('soft delete failed'));

        await expect(deletePoolCompanyByAdminService.softDeletePoolCompanyByAdmin('co1'))
            .rejects.toEqual({ success: false });
        expect(console.error).toHaveBeenCalled();
    });
});