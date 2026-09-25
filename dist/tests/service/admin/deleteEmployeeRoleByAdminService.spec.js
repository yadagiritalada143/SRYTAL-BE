"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteEmployeeRoleByAdminService_1 = __importDefault(require("../../../services/admin/deleteEmployeeRoleByAdminService"));
const employeeRole_1 = __importDefault(require("../../../model/employeeRole"));
jest.mock('../../../model/employeeRole', () => ({
    __esModule: true,
    default: { findByIdAndDelete: jest.fn() }
}));
const findByIdAndDeleteMock = employeeRole_1.default.findByIdAndDelete;
describe('deleteEmployeeRoleByAdminService', () => {
    beforeEach(() => {
        findByIdAndDeleteMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns success with the deleted role when a document is deleted', async () => {
        const deletedRole = { _id: 'r1', roleName: 'Admin' };
        findByIdAndDeleteMock.mockResolvedValue(deletedRole);
        const result = await deleteEmployeeRoleByAdminService_1.default.deleteEmployeeRoleByAdmin('r1');
        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(findByIdAndDeleteMock).toHaveBeenCalledWith({ _id: 'r1' });
        expect(result).toEqual({ success: true, responseAfterDelete: deletedRole });
    });
    it('returns success false with a null response when no document matches', async () => {
        findByIdAndDeleteMock.mockResolvedValue(null);
        const result = await deleteEmployeeRoleByAdminService_1.default.deleteEmployeeRoleByAdmin('r5');
        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false, responseAfterDelete: null });
    });
    it('returns the error in the response when deletion fails', async () => {
        const deleteError = new Error('Delete failed');
        findByIdAndDeleteMock.mockRejectedValue(deleteError);
        const result = await deleteEmployeeRoleByAdminService_1.default.deleteEmployeeRoleByAdmin('r1');
        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false, responseAfterDelete: deleteError });
    });
});
