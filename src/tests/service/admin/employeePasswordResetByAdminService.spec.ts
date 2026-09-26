import employeePasswordResetByAdminService from '../../../services/admin/employeePasswordResetByAdminService';
import UserModel from '../../../model/userModel';
import hashPasswordUtility from '../../../util/hashPassword';
import utilService from '../../../util/sendResetPasswordMail';

jest.mock('../../../model/userModel', () => {
    const UserModel = jest.fn();
    (UserModel as any).findOne = jest.fn();
    (UserModel as any).findOneAndUpdate = jest.fn();
    return { __esModule: true, default: UserModel };
});

jest.mock('../../../util/hashPassword', () => ({
    __esModule: true,
    default: { hashPassword: jest.fn() }
}));

jest.mock('../../../util/sendResetPasswordMail', () => ({
    __esModule: true,
    default: { sendResetPasswordMail: jest.fn() }
}));

const UserModelMock = UserModel as unknown as jest.Mock & {
    findOne: jest.Mock;
    findOneAndUpdate: jest.Mock;
};
const hashPasswordMock = hashPasswordUtility.hashPassword as unknown as jest.Mock;
const sendResetPasswordMailMock = utilService.sendResetPasswordMail as unknown as jest.Mock;

describe('employeePasswordResetByAdminService', () => {
    beforeEach(() => {
        UserModelMock.findOne = jest.fn();
        UserModelMock.findOneAndUpdate = jest.fn();
        hashPasswordMock.mockReset();
        sendResetPasswordMailMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns { success: false } when the user does not exist', async () => {
        UserModelMock.findOne.mockResolvedValue(null);

        const result = await employeePasswordResetByAdminService.employeePasswordResetByAdmin('emp1');

        expect(UserModelMock.findOne).toHaveBeenCalledTimes(1);
        expect(UserModelMock.findOne).toHaveBeenCalledWith({ _id: 'emp1' });
        expect(hashPasswordMock).not.toHaveBeenCalled();
        expect(sendResetPasswordMailMock).not.toHaveBeenCalled();
        expect(UserModelMock.findOneAndUpdate).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, message: 'User not exists!' });
    });

    it('resets the password, sends the mail and returns success', async () => {
        UserModelMock.findOne.mockResolvedValue({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com'
        });
        hashPasswordMock.mockResolvedValue('hashed-password');
        sendResetPasswordMailMock.mockResolvedValue('sent');
        UserModelMock.findOneAndUpdate.mockResolvedValue({ _id: 'emp1' });

        const result = await employeePasswordResetByAdminService.employeePasswordResetByAdmin('emp1');

        expect(UserModelMock.findOne).toHaveBeenCalledTimes(1);
        expect(UserModelMock.findOne).toHaveBeenCalledWith({ _id: 'emp1' });
        expect(hashPasswordMock).toHaveBeenCalledTimes(1);
        expect(hashPasswordMock.mock.calls[0][0]).toMatch(/^[0-9]{8}$/);
        expect(sendResetPasswordMailMock).toHaveBeenCalledTimes(1);
        expect(sendResetPasswordMailMock).toHaveBeenCalledWith(
            'John',
            'Doe',
            'john@example.com',
            hashPasswordMock.mock.calls[0][0]
        );
        expect(UserModelMock.findOneAndUpdate).toHaveBeenCalledTimes(1);
        expect(UserModelMock.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: 'emp1' },
            { password: 'hashed-password', passwordResetRequired: 'true' },
            { new: true }
        );
        expect(result).toEqual({
            success: true,
            message: 'Email sent successfully. Please login with temporary password.'
        });
    });

    it('returns { success: false } when the password update fails to produce a user', async () => {
        UserModelMock.findOne.mockResolvedValue({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com'
        });
        hashPasswordMock.mockResolvedValue('hashed-password');
        sendResetPasswordMailMock.mockResolvedValue('sent');
        UserModelMock.findOneAndUpdate.mockResolvedValue(null);

        const result = await employeePasswordResetByAdminService.employeePasswordResetByAdmin('emp1');

        expect(UserModelMock.findOneAndUpdate).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false, message: 'Error in updating password!' });
    });

    it('propagates errors thrown during the reset flow', async () => {
        const resetError = new Error('Reset failed');
        UserModelMock.findOne.mockRejectedValue(resetError);

        await expect(
            employeePasswordResetByAdminService.employeePasswordResetByAdmin('emp1')
        ).rejects.toThrow(resetError);

        expect(UserModelMock.findOne).toHaveBeenCalledTimes(1);
    });
});