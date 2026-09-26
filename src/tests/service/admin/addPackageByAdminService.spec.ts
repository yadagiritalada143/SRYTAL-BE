import addPackageByAdminService from '../../../services/admin/addPackageByAdminService';
import PackagesModel from '../../../model/packageModel';
import { IPackage } from '../../../interfaces/package';

jest.mock('../../../model/packageModel', () => {
    const PackagesModel = jest.fn();
    return { __esModule: true, default: PackagesModel };
});

const PackagesModelMock = PackagesModel as unknown as jest.Mock;

describe('addPackageByAdminService', () => {
    let saveSpy: jest.Mock;

    beforeEach(() => {
        PackagesModelMock.mockReset();
        saveSpy = jest.fn();
        PackagesModelMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('creates a package document with the given data and saves it successfully', async () => {
        const packageData = { name: 'Premium', isDeleted: false } as unknown as IPackage;
        const savedPackage = { _id: 'pkg1', name: 'Premium', isDeleted: false };
        saveSpy.mockResolvedValue(savedPackage);

        const result = await addPackageByAdminService.addPackageByAdmin(packageData);

        expect(PackagesModelMock).toHaveBeenCalledTimes(1);
        expect(PackagesModelMock).toHaveBeenCalledWith(packageData);
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(savedPackage);
    });

    it('propagates the error when the save fails', async () => {
        const saveError = new Error('Database save failed');
        saveSpy.mockRejectedValue(saveError);

        await expect(addPackageByAdminService.addPackageByAdmin({ name: 'Premium' } as unknown as IPackage)).rejects.toThrow(saveError);
        expect(PackagesModelMock).toHaveBeenCalledTimes(1);
        expect(PackagesModelMock).toHaveBeenCalledWith({ name: 'Premium' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
    });
});