"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updatePackageByAdminService_1 = __importDefault(require("../../../services/admin/updatePackageByAdminService"));
const packageModel_1 = __importDefault(require("../../../model/packageModel"));
jest.mock('../../../model/packageModel', () => ({
    __esModule: true,
    default: { updateOne: jest.fn() }
}));
const updateOneMock = packageModel_1.default.updateOne;
describe('updatePackageByAdminService', () => {
    beforeEach(() => {
        updateOneMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns success with the update result when updateOne resolves', async () => {
        const updateResult = { modifiedCount: 1 };
        const detailsToUpdate = { name: 'Premium' };
        updateOneMock.mockResolvedValue(updateResult);
        const result = await updatePackageByAdminService_1.default.updatePackageByAdmin('p1', detailsToUpdate);
        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(updateOneMock).toHaveBeenCalledWith({ _id: 'p1' }, { name: 'Premium' });
        expect(result).toEqual({ success: true, responseAfterUpdate: updateResult });
    });
    it('returns success false when updateOne resolves a falsy value', async () => {
        updateOneMock.mockResolvedValue(null);
        const result = await updatePackageByAdminService_1.default.updatePackageByAdmin('p1', { name: 'Basic' });
        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });
    it('returns the error in the response when updateOne rejects', async () => {
        const updateError = new Error('Update failed');
        updateOneMock.mockRejectedValue(updateError);
        const result = await updatePackageByAdminService_1.default.updatePackageByAdmin('p1', { name: 'Basic' });
        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false, responseAfterUpdate: updateError });
    });
});
