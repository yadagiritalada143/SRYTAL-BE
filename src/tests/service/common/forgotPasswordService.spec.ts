import forgotPasswordService from '../../../services/common/forgotPasswordService';
import UserModel from '../../../model/userModel';
import utilService from '../../../util/sendForgetPasswordOTPEmail';
import hashPasswordUtility from '../../../util/hashPassword';

jest.mock('../../../model/userModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn(), findOneAndUpdate: jest.fn() }
}));

jest.mock('../../../util/sendForgetPasswordOTPEmail', () => ({
    __esModule: true,
    default: { sendOTPEmail: jest.fn() }
}));

jest.mock('../../../util/hashPassword', () => ({
    __esModule: true,
    default: { hashPassword: jest.fn() }
}));

const findOneMock = (UserModel as unknown as { findOne: jest.Mock }).findOne;
const findOneAndUpdateMock = (UserModel as unknown as { findOneAndUpdate: jest.Mock }).findOneAndUpdate;
const sendOTPEmailMock = (utilService as unknown as { sendOTPEmail: jest.Mock }).sendOTPEmail;
const hashPasswordMock = (hashPasswordUtility as unknown as { hashPassword: jest.Mock }).hashPassword;

const buildChain = (user: any, error?: Error) => {
    const chain: any = {};
    chain.then = (onFulfilled: any) => {
        if (error) {
            return Promise.reject(error);
        }
        return Promise.resolve(user).then(onFulfilled);
    };
    return chain;
};

describe('forgotPasswordService', () => {
    beforeEach(() => {
        findOneMock.mockReset();
        findOneAndUpdateMock.mockReset();
        sendOTPEmailMock.mockReset();
        hashPasswordMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('resolves with a failure message when the user does not exist', async () => {
        findOneMock.mockReturnValue(buildChain(null));

        const result = await forgotPasswordService.forgotPassword('missing@example.com');

        expect(findOneMock).toHaveBeenCalledWith({ email: 'missing@example.com' });
        expect(result).toEqual({ success: false, message: 'User not Exists !' });
    });

    it('sends an OTP and updates the password on success', async () => {
        const user = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com'
        };
        findOneMock.mockReturnValue(buildChain(user));
        hashPasswordMock.mockResolvedValue('hashed-password');
        findOneAndUpdateMock.mockResolvedValue({ _id: 'u1' });

        const result = await forgotPasswordService.forgotPassword('john@example.com');

        expect(hashPasswordMock).toHaveBeenCalledTimes(1);
        expect(sendOTPEmailMock).toHaveBeenCalledWith('John', 'Doe', 'john@example.com', expect.any(String));
        expect(findOneAndUpdateMock).toHaveBeenCalledWith(
            { email: 'john@example.com' },
            { password: 'hashed-password', passwordResetRequired: 'true' }
        );
        expect(result).toEqual({
            success: true,
            message: 'Email Sent successfully to you. Please check your Inbox and come back to Login page and then login with your temporary password !'
        });
    });

    it('rejects with a failure message when the password update returns no result', async () => {
        const user = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' };
        findOneMock.mockReturnValue(buildChain(user));
        hashPasswordMock.mockResolvedValue('hashed-password');
        findOneAndUpdateMock.mockResolvedValue(null);

        await expect(forgotPasswordService.forgotPassword('john@example.com')).rejects.toEqual({
            success: false,
            message: 'Error in sending OTP to user !'
        });
    });

    it('rejects with a failure message when the lookup throws', async () => {
        findOneMock.mockReturnValue(buildChain(undefined, new Error('DB down')));

        await expect(forgotPasswordService.forgotPassword('john@example.com')).rejects.toEqual({
            success: false,
            message: 'Error in forget password flow !'
        });
    });
});