import registerAdminBySuperadminService from '../../../services/superadmin/registerAdminBySuperadminService';
import UserModel from '../../../model/userModel';

jest.mock('../../../model/userModel', () => {
    const UserModel = jest.fn();
    (UserModel as any).findOne = jest.fn();
    return { __esModule: true, default: UserModel };
});

const UserModelMock = UserModel as unknown as jest.Mock & { findOne: jest.Mock };

describe('registerAdminBySuperadminService', () => {
    let saveSpy: jest.Mock;

    beforeEach(() => {
        UserModelMock.mockReset();
        UserModelMock.findOne = jest.fn();
        saveSpy = jest.fn();
        UserModelMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('isAccountPresent', () => {
        it('returns true when a user with the email exists', async () => {
            const chain: any = {};
            chain.then = (onFulfilled: any) => {
                return onFulfilled({ _id: 'u1', email: 'admin@x.com' });
            };
            UserModelMock.findOne.mockReturnValue(chain);

            const result = await registerAdminBySuperadminService.isAccountPresent('admin@x.com');

            expect(UserModelMock.findOne).toHaveBeenCalledWith({ email: 'admin@x.com' });
            expect(result).toBe(true);
        });

        it('returns false when no user with the email exists', async () => {
            const chain: any = {};
            chain.then = (onFulfilled: any) => {
                return onFulfilled(null);
            };
            UserModelMock.findOne.mockReturnValue(chain);

            const result = await registerAdminBySuperadminService.isAccountPresent('new@x.com');

            expect(UserModelMock.findOne).toHaveBeenCalledWith({ email: 'new@x.com' });
            expect(result).toBe(false);
        });
    });

    describe('saveAccount', () => {
        it('creates and saves a user document successfully', async () => {
            const userData = {
                email: 'admin@x.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'hashed-pw',
                organization: 'org1'
            };
            const savedUser = { _id: 'u1', ...userData };
            saveSpy.mockResolvedValue(savedUser);

            const result = await registerAdminBySuperadminService.saveAccount(userData as any);

            expect(UserModelMock).toHaveBeenCalledTimes(1);
            expect(UserModelMock).toHaveBeenCalledWith(userData);
            expect(saveSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual(savedUser);
        });

        it('propagates the error when save fails', async () => {
            const userData = { email: 'admin@x.com' };
            saveSpy.mockRejectedValue(new Error('DB error'));

            await expect(registerAdminBySuperadminService.saveAccount(userData as any))
                .rejects.toThrow('DB error');
        });
    });
});
