import updatePackageByAdminService from '../../../services/admin/updatePackageByAdminService';
import PackagesModel from '../../../model/packageModel';

jest.mock('../../../model/packageModel', () => ({
    __esModule: true,
    default: { updateOne: jest.fn() }
}));

const updateOneMock = (PackagesModel as unknown as { updateOne: jest.Mock }).updateOne;

describe('updatePackageByAdminService', () => {
    beforeEach(() => {
        updateOneMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns success with the update result when updateOne resolves', async () => {
        const updateResult = { modifiedCount: 1 };
        const detailsToUpdate = { name: 'Premium' } as any;
        updateOneMock.mockResolvedValue(updateResult);

        const result = await updatePackageByAdminService.updatePackageByAdmin('p1', detailsToUpdate);

        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(updateOneMock).toHaveBeenCalledWith({ _id: 'p1' }, { name: 'Premium' });
        expect(result).toEqual({ success: true, responseAfterUpdate: updateResult });
    });

    it('returns success false when updateOne resolves a falsy value', async () => {
        updateOneMock.mockResolvedValue(null);

        const result = await updatePackageByAdminService.updatePackageByAdmin('p1', { name: 'Basic' } as any);

        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });

    it('returns the error in the response when updateOne rejects', async () => {
        const updateError = new Error('Update failed');
        updateOneMock.mockRejectedValue(updateError);

        const result = await updatePackageByAdminService.updatePackageByAdmin('p1', { name: 'Basic' } as any);

        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false, responseAfterUpdate: updateError });
    });
});