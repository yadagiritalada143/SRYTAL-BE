import updatePasswordService from '../../../services/common/updatePasswordService';
import UserModel from '../../../model/userModel';
import bcrypt from 'bcrypt';
import hashPasswordUtility from '../../../util/hashPassword';

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn()
}));

jest.mock('../../../util/hashPassword', () => ({
    __esModule: true,
    default: { hashPassword: jest.fn() }
}));

jest.mock('../../../model/userModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn(), updateOne: jest.fn() }
}));

const findOneMock = (UserModel as unknown as { findOne: jest.Mock }).findOne;
const updateOneMock = (UserModel as unknown as { updateOne: jest.Mock }).updateOne;
const bcryptCompareMock = bcrypt.compare as unknown as jest.Mock;
const hashPasswordMock = hashPasswordUtility.hashPassword as unknown as jest.Mock;

const details = {
    userId: 'u1',
    oldPassword: 'old-password',
    newPassword: 'new-password'
};

describe('updatePasswordService', () => {
    beforeEach(() => {
        findOneMock.mockReset();
        updateOneMock.mockReset();
        bcryptCompareMock.mockReset();
        hashPasswordMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('resolves with user not exists when no user is found', async () => {
        findOneMock.mockResolvedValue(null);

        const result = await updatePasswordService.updatePassword(details);

        expect(findOneMock).toHaveBeenCalledTimes(1);
        expect(findOneMock).toHaveBeenCalledWith({ _id: 'u1' });
        expect(bcryptCompareMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, message: 'User not Exists !' });
    });

    it('resolves with temporary password mismatch when the old password is invalid', async () => {
        findOneMock.mockResolvedValue({ password: 'hashed' });
        bcryptCompareMock.mockResolvedValue(false);

        const result = await updatePasswordService.updatePassword(details);

        expect(bcryptCompareMock).toHaveBeenCalledWith('old-password', 'hashed');
        expect(hashPasswordMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, message: 'Temporary password is not matched !' });
    });

    it('updates the password and resolves success when verification passes', async () => {
        findOneMock.mockResolvedValue({ password: 'hashed' });
        bcryptCompareMock.mockResolvedValue(true);
        hashPasswordMock.mockResolvedValue('new-hash');
        updateOneMock.mockResolvedValue({ nModified: 1 });

        const result = await updatePasswordService.updatePassword(details);

        expect(bcryptCompareMock).toHaveBeenCalledWith('old-password', 'hashed');
        expect(hashPasswordMock).toHaveBeenCalledWith('new-password');
        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(updateOneMock).toHaveBeenCalledWith(
            { _id: 'u1' },
            { password: 'new-hash', passwordResetRequired: false }
        );
        expect(result).toEqual({ success: true, message: 'Password updated Successfully !' });
    });

    it('rejects when hashing the new password fails', async () => {
        findOneMock.mockResolvedValue({ password: 'hashed' });
        bcryptCompareMock.mockResolvedValue(true);
        hashPasswordMock.mockRejectedValue(new Error('hash failed'));

        await expect(updatePasswordService.updatePassword(details)).rejects.toEqual({
            success: false,
            message: 'Error while updating the password !'
        });
    });

    it('rejects when the user lookup fails', async () => {
        findOneMock.mockRejectedValue(new Error('DB down'));

        await expect(updatePasswordService.updatePassword(details)).rejects.toEqual({
            success: false,
            message: 'Error while updating the password !'
        });
    });
});