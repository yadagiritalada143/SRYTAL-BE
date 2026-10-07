"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deletePackageByAdminService_1 = __importDefault(require("../../../services/admin/deletePackageByAdminService"));
const packageModel_1 = __importDefault(require("../../../model/packageModel"));
jest.mock('../../../model/packageModel', () => ({
    __esModule: true,
    default: { deleteOne: jest.fn(), updateOne: jest.fn() }
}));
const deleteOneMock = packageModel_1.default.deleteOne;
const updateOneMock = packageModel_1.default.updateOne;
describe('deletePackageByAdminService', () => {
    beforeEach(() => {
        deleteOneMock.mockReset();
        updateOneMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe('hardDeletePackageServiceByAdmin', () => {
        it('resolves success true when the package is deleted', async () => {
            deleteOneMock.mockResolvedValue({ deletedCount: 1 });
            const result = await deletePackageByAdminService_1.default.hardDeletePackageServiceByAdmin('p1');
            expect(deleteOneMock).toHaveBeenCalledTimes(1);
            expect(deleteOneMock).toHaveBeenCalledWith({ _id: 'p1' });
            expect(result).toEqual({ success: true });
        });
        it('rejects with success false when deletion fails', async () => {
            deleteOneMock.mockRejectedValue(new Error('Delete failed'));
            await expect(deletePackageByAdminService_1.default.hardDeletePackageServiceByAdmin('p1')).rejects.toEqual({
                success: false
            });
            expect(deleteOneMock).toHaveBeenCalledTimes(1);
            expect(deleteOneMock).toHaveBeenCalledWith({ _id: 'p1' });
        });
    });
    describe('softDeletePackageServiceByAdmin', () => {
        it('resolves success true when the package is soft deleted', async () => {
            updateOneMock.mockResolvedValue({ modifiedCount: 1 });
            const result = await deletePackageByAdminService_1.default.softDeletePackageServiceByAdmin('p1');
            expect(updateOneMock).toHaveBeenCalledTimes(1);
            expect(updateOneMock).toHaveBeenCalledWith({ _id: 'p1' }, { isDeleted: true });
            expect(result).toEqual({ success: true });
        });
        it('rejects with success false when soft deletion fails', async () => {
            updateOneMock.mockRejectedValue(new Error('Soft delete failed'));
            await expect(deletePackageByAdminService_1.default.softDeletePackageServiceByAdmin('p1')).rejects.toEqual({
                success: false
            });
            expect(updateOneMock).toHaveBeenCalledTimes(1);
            expect(updateOneMock).toHaveBeenCalledWith({ _id: 'p1' }, { isDeleted: true });
        });
    });
});
