"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteBloodGroupByAdminService_1 = __importDefault(require("../../../services/admin/deleteBloodGroupByAdminService"));
const bloodGroupModel_1 = __importDefault(require("../../../model/bloodGroupModel"));
jest.mock('../../../model/bloodGroupModel', () => ({
    __esModule: true,
    default: { findByIdAndDelete: jest.fn() }
}));
const findByIdAndDeleteMock = bloodGroupModel_1.default.findByIdAndDelete;
describe('deleteBloodGroupByAdminService', () => {
    beforeEach(() => {
        findByIdAndDeleteMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns success with the deleted group when a document is deleted', async () => {
        const deletedGroup = { _id: 'bg1', bloodType: 'A+' };
        findByIdAndDeleteMock.mockResolvedValue(deletedGroup);
        const result = await deleteBloodGroupByAdminService_1.default.deleteBloodGroupByAdmin('bg1');
        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(findByIdAndDeleteMock).toHaveBeenCalledWith({ _id: 'bg1' });
        expect(result).toEqual({ success: true, responseAfterDelete: deletedGroup });
    });
    it('returns success false when no document matches the id', async () => {
        findByIdAndDeleteMock.mockResolvedValue(null);
        const result = await deleteBloodGroupByAdminService_1.default.deleteBloodGroupByAdmin('bg4');
        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });
    it('returns the error in the response when deletion fails', async () => {
        const deleteError = new Error('Delete failed');
        findByIdAndDeleteMock.mockRejectedValue(deleteError);
        const result = await deleteBloodGroupByAdminService_1.default.deleteBloodGroupByAdmin('bg1');
        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false, responseAfterDelete: deleteError });
    });
});
