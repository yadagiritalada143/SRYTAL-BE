import deleteEmployeeDetailsByAdminService from '../../../services/admin/deleteEmployeeDetailsByAdminService';
import UserModel from '../../../model/userModel';

jest.mock('../../../model/userModel', () => {
    const UserModel = jest.fn();
    (UserModel as any).deleteOne = jest.fn();
    (UserModel as any).updateOne = jest.fn();
    return { __esModule: true, default: UserModel };
});

const UserModelMock = UserModel as unknown as jest.Mock & {
    deleteOne: jest.Mock;
    updateOne: jest.Mock;
};

describe('deleteEmployeeDetailsByAdminService', () => {
    beforeEach(() => {
        UserModelMock.mockReset();
        UserModelMock.deleteOne = jest.fn();
        UserModelMock.updateOne = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('hard deletes the profile and resolves { success: true }', async () => {
        UserModelMock.deleteOne.mockResolvedValue({ deletedCount: 1 });

        const result = await deleteEmployeeDetailsByAdminService.hardDeleteEmployeeProfileByAdmin('u1');

        expect(UserModelMock.deleteOne).toHaveBeenCalledWith({ _id: 'u1' });
        expect(result).toEqual({ success: true });
    });

    it('rejects { success: false } and logs when hard delete fails', async () => {
        UserModelMock.deleteOne.mockRejectedValue(new Error('hard delete failed'));

        await expect(deleteEmployeeDetailsByAdminService.hardDeleteEmployeeProfileByAdmin('u1'))
            .rejects.toEqual({ success: false });
        expect(console.error).toHaveBeenCalled();
    });

    it('soft deletes the profile and resolves { success: true }', async () => {
        UserModelMock.updateOne.mockResolvedValue({ modifiedCount: 1 });

        const result = await deleteEmployeeDetailsByAdminService.softDeleteEmployeeProfileByAdmin('u1');

        expect(UserModelMock.updateOne).toHaveBeenCalledWith({ _id: 'u1' }, { isDeleted: true });
        expect(result).toEqual({ success: true });
    });

    it('rejects { success: false } and logs when soft delete fails', async () => {
        UserModelMock.updateOne.mockRejectedValue(new Error('soft delete failed'));

        await expect(deleteEmployeeDetailsByAdminService.softDeleteEmployeeProfileByAdmin('u1'))
            .rejects.toEqual({ success: false });
        expect(console.error).toHaveBeenCalled();
    });
});