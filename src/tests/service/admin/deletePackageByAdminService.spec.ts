import deletePackageByAdminService from '../../../services/admin/deletePackageByAdminService';
import PackagesModel from '../../../model/packageModel';

jest.mock('../../../model/packageModel', () => ({
    __esModule: true,
    default: { deleteOne: jest.fn(), updateOne: jest.fn() }
}));

const deleteOneMock = (PackagesModel as unknown as { deleteOne: jest.Mock }).deleteOne;
const updateOneMock = (PackagesModel as unknown as { updateOne: jest.Mock }).updateOne;

describe('deletePackageByAdminService', () => {
    beforeEach(() => {
        deleteOneMock.mockReset();
        updateOneMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('hardDeletePackageServiceByAdmin', () => {
        it('resolves success true when the package is deleted', async () => {
            deleteOneMock.mockResolvedValue({ deletedCount: 1 });

            const result = await deletePackageByAdminService.hardDeletePackageServiceByAdmin('p1');

            expect(deleteOneMock).toHaveBeenCalledTimes(1);
            expect(deleteOneMock).toHaveBeenCalledWith({ _id: 'p1' });
            expect(result).toEqual({ success: true });
        });

        it('rejects with success false when deletion fails', async () => {
            deleteOneMock.mockRejectedValue(new Error('Delete failed'));

            await expect(deletePackageByAdminService.hardDeletePackageServiceByAdmin('p1')).rejects.toEqual({
                success: false
            });

            expect(deleteOneMock).toHaveBeenCalledTimes(1);
            expect(deleteOneMock).toHaveBeenCalledWith({ _id: 'p1' });
        });
    });

    describe('softDeletePackageServiceByAdmin', () => {
        it('resolves success true when the package is soft deleted', async () => {
            updateOneMock.mockResolvedValue({ modifiedCount: 1 });

            const result = await deletePackageByAdminService.softDeletePackageServiceByAdmin('p1');

            expect(updateOneMock).toHaveBeenCalledTimes(1);
            expect(updateOneMock).toHaveBeenCalledWith({ _id: 'p1' }, { isDeleted: true });
            expect(result).toEqual({ success: true });
        });

        it('rejects with success false when soft deletion fails', async () => {
            updateOneMock.mockRejectedValue(new Error('Soft delete failed'));

            await expect(deletePackageByAdminService.softDeletePackageServiceByAdmin('p1')).rejects.toEqual({
                success: false
            });

            expect(updateOneMock).toHaveBeenCalledTimes(1);
            expect(updateOneMock).toHaveBeenCalledWith({ _id: 'p1' }, { isDeleted: true });
        });
    });
});