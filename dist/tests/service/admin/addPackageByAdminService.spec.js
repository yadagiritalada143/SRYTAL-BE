"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addPackageByAdminService_1 = __importDefault(require("../../../services/admin/addPackageByAdminService"));
const packageModel_1 = __importDefault(require("../../../model/packageModel"));
jest.mock('../../../model/packageModel', () => {
    const PackagesModel = jest.fn();
    return { __esModule: true, default: PackagesModel };
});
const PackagesModelMock = packageModel_1.default;
describe('addPackageByAdminService', () => {
    let saveSpy;
    beforeEach(() => {
        PackagesModelMock.mockReset();
        saveSpy = jest.fn();
        PackagesModelMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('creates a package document with the given data and saves it successfully', async () => {
        const packageData = { name: 'Premium', isDeleted: false };
        const savedPackage = { _id: 'pkg1', name: 'Premium', isDeleted: false };
        saveSpy.mockResolvedValue(savedPackage);
        const result = await addPackageByAdminService_1.default.addPackageByAdmin(packageData);
        expect(PackagesModelMock).toHaveBeenCalledTimes(1);
        expect(PackagesModelMock).toHaveBeenCalledWith(packageData);
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(savedPackage);
    });
    it('propagates the error when the save fails', async () => {
        const saveError = new Error('Database save failed');
        saveSpy.mockRejectedValue(saveError);
        await expect(addPackageByAdminService_1.default.addPackageByAdmin({ name: 'Premium' })).rejects.toThrow(saveError);
        expect(PackagesModelMock).toHaveBeenCalledTimes(1);
        expect(PackagesModelMock).toHaveBeenCalledWith({ name: 'Premium' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
    });
});
