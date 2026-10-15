"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteEmployeeDetailsByAdminService_1 = __importDefault(require("../../../services/admin/deleteEmployeeDetailsByAdminService"));
const userModel_1 = __importDefault(require("../../../model/userModel"));
jest.mock('../../../model/userModel', () => {
    const UserModel = jest.fn();
    UserModel.deleteOne = jest.fn();
    UserModel.updateOne = jest.fn();
    return { __esModule: true, default: UserModel };
});
const UserModelMock = userModel_1.default;
describe('deleteEmployeeDetailsByAdminService', () => {
    beforeEach(() => {
        UserModelMock.mockReset();
        UserModelMock.deleteOne = jest.fn();
        UserModelMock.updateOne = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('hard deletes the profile and resolves { success: true }', async () => {
        UserModelMock.deleteOne.mockResolvedValue({ deletedCount: 1 });
        const result = await deleteEmployeeDetailsByAdminService_1.default.hardDeleteEmployeeProfileByAdmin('u1');
        expect(UserModelMock.deleteOne).toHaveBeenCalledWith({ _id: 'u1' });
        expect(result).toEqual({ success: true });
    });
    it('rejects { success: false } and logs when hard delete fails', async () => {
        UserModelMock.deleteOne.mockRejectedValue(new Error('hard delete failed'));
        await expect(deleteEmployeeDetailsByAdminService_1.default.hardDeleteEmployeeProfileByAdmin('u1'))
            .rejects.toEqual({ success: false });
        expect(console.error).toHaveBeenCalled();
    });
    it('soft deletes the profile and resolves { success: true }', async () => {
        UserModelMock.updateOne.mockResolvedValue({ modifiedCount: 1 });
        const result = await deleteEmployeeDetailsByAdminService_1.default.softDeleteEmployeeProfileByAdmin('u1');
        expect(UserModelMock.updateOne).toHaveBeenCalledWith({ _id: 'u1' }, { isDeleted: true });
        expect(result).toEqual({ success: true });
    });
    it('rejects { success: false } and logs when soft delete fails', async () => {
        UserModelMock.updateOne.mockRejectedValue(new Error('soft delete failed'));
        await expect(deleteEmployeeDetailsByAdminService_1.default.softDeleteEmployeeProfileByAdmin('u1'))
            .rejects.toEqual({ success: false });
        expect(console.error).toHaveBeenCalled();
    });
});
