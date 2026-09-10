import registerEmployeeByAdminService from '../../../services/admin/registerEmployeeByAdminService';
import UserModel from '../../../model/userModel';

jest.mock('../../../model/userModel', () => {
    const UserModel = jest.fn();
    (UserModel as any).findOne = jest.fn();
    return { __esModule: true, default: UserModel };
});

const UserModelMock = UserModel as unknown as jest.Mock & { findOne: jest.Mock };

describe('registerEmployeeByAdminService', () => {
    let saveSpy: jest.Mock;

    beforeEach(() => {
        UserModelMock.mockReset();
        UserModelMock.findOne = jest.fn();
        saveSpy = jest.fn();
        UserModelMock.mockReturnValue({ save: saveSpy });
    });

    describe('isAccountPresent', () => {
        it('returns true when a user with the email exists', async () => {
            UserModelMock.findOne.mockResolvedValue({ _id: 'u1', email: 'a@x.com' });

            const result = await registerEmployeeByAdminService.isAccountPresent('a@x.com');

            expect(UserModelMock.findOne).toHaveBeenCalledTimes(1);
            expect(UserModelMock.findOne).toHaveBeenCalledWith({ email: 'a@x.com' });
            expect(result).toBe(true);
        });

        it('returns false when no user matches the email', async () => {
            UserModelMock.findOne.mockResolvedValue(null);

            const result = await registerEmployeeByAdminService.isAccountPresent('b@x.com');

            expect(UserModelMock.findOne).toHaveBeenCalledTimes(1);
            expect(UserModelMock.findOne).toHaveBeenCalledWith({ email: 'b@x.com' });
            expect(result).toBe(false);
        });
    });

    describe('saveAccount', () => {
        it('saves the user data and returns the result', async () => {
            const userData = { email: 'a@x.com', password: 'hashed' };
            const saved = { _id: 'u1', ...userData };
            saveSpy.mockResolvedValue(saved);

            const result = await registerEmployeeByAdminService.saveAccount(userData as any);

            expect(UserModelMock).toHaveBeenCalledTimes(1);
            expect(UserModelMock).toHaveBeenCalledWith({ ...userData });
            expect(saveSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual(saved);
        });

        it('propagates errors thrown by save', async () => {
            const saveError = new Error('Save failed');
            saveSpy.mockRejectedValue(saveError);

            await expect(registerEmployeeByAdminService.saveAccount({ email: 'a@x.com' } as any)).rejects.toThrow(
                saveError
            );

            expect(UserModelMock).toHaveBeenCalledTimes(1);
        });
    });
});