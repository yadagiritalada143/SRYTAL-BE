import manageCommonService from '../../../services/common/manageCommonService';
import UserModel from '../../../model/userModel';
import VisitorsCountModel from '../../../model/visitorsCountModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import csrf from 'csrf-token';

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn()
}));

jest.mock('csrf-token', () => ({
    __esModule: true,
    default: { createSync: jest.fn() }
}));

jest.mock('../../../model/userModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn(), findOneAndUpdate: jest.fn() }
}));

jest.mock('../../../model/visitorsCountModel', () => ({
    __esModule: true,
    default: { find: jest.fn(), updateOne: jest.fn() }
}));

const findOneMock = (UserModel as unknown as { findOne: jest.Mock }).findOne;
const findOneAndUpdateMock = (UserModel as unknown as { findOneAndUpdate: jest.Mock }).findOneAndUpdate;
const visitorsFindMock = (VisitorsCountModel as unknown as { find: jest.Mock }).find;
const visitorsUpdateOneMock = (VisitorsCountModel as unknown as { updateOne: jest.Mock }).updateOne;
const bcryptCompareMock = bcrypt.compare as unknown as jest.Mock;
const jwtSignMock = jwt.sign as unknown as jest.Mock;
const jwtVerifyMock = jwt.verify as unknown as jest.Mock;
const csrfCreateSyncMock = csrf.createSync as unknown as jest.Mock;

describe('manageCommonService', () => {
    beforeEach(() => {
        findOneMock.mockReset();
        findOneAndUpdateMock.mockReset();
        visitorsFindMock.mockReset();
        visitorsUpdateOneMock.mockReset();
        bcryptCompareMock.mockReset();
        jwtSignMock.mockReset();
        jwtVerifyMock.mockReset();
        csrfCreateSyncMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('updateVisitorCount', () => {
        it('increments and returns the visitor count', async () => {
            visitorsFindMock.mockResolvedValue([{ visitorCount: 5 }]);
            visitorsUpdateOneMock.mockResolvedValue({ nModified: 1 });

            const result = await manageCommonService.updateVisitorCount();

            expect(visitorsFindMock).toHaveBeenCalledTimes(1);
            expect(visitorsUpdateOneMock).toHaveBeenCalledTimes(1);
            expect(visitorsUpdateOneMock).toHaveBeenCalledWith({
                visitorCount: 6,
                lastUpdatedAt: expect.any(Number)
            });
            expect(result).toBe(5);
        });
    });

    describe('createCSRFToken', () => {
        it('resolves with the generated csrf token', async () => {
            csrfCreateSyncMock.mockReturnValue('csrf-token-123');

            await expect(manageCommonService.createCSRFToken()).resolves.toBe('csrf-token-123');

            expect(csrfCreateSyncMock).toHaveBeenCalledTimes(1);
            expect(csrfCreateSyncMock).toHaveBeenCalledWith('auth-module project');
        });

        it('rejects when csrf token generation throws', async () => {
            csrfCreateSyncMock.mockImplementation(() => {
                throw new Error('CSRF failed');
            });

            await expect(manageCommonService.createCSRFToken()).rejects.toThrow('CSRF failed');
        });
    });

    describe('authenticateAccount', () => {
        const baseUser = {
            id: 'u1',
            organization: 'org1',
            email: 'a@x.com',
            password: 'hashed',
            userRole: 'employee',
            passwordResetRequired: 'false',
            applicationWalkThrough: 0,
            firstName: 'John',
            lastName: 'Doe',
            lastLoggedOn: null,
            refreshToken: '',
            save: jest.fn()
        };

        it('resolves success false when the user does not exist', async () => {
            findOneMock.mockResolvedValue(null);

            const result = await manageCommonService.authenticateAccount({ email: 'a@x.com', password: 'pw' });

            expect(findOneMock).toHaveBeenCalledTimes(1);
            expect(findOneMock).toHaveBeenCalledWith({ email: 'a@x.com' });
            expect(result).toEqual({ success: false });
        });

        it('resolves success false when the password is invalid', async () => {
            findOneMock.mockResolvedValue({ ...baseUser, save: jest.fn() });
            bcryptCompareMock.mockResolvedValue(false);

            const result = await manageCommonService.authenticateAccount({ email: 'a@x.com', password: 'bad' });

            expect(bcryptCompareMock).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ success: false });
        });

        it('resolves with the auth payload on a successful login', async () => {
            const user = { ...baseUser, save: jest.fn() };
            findOneMock.mockResolvedValue(user);
            bcryptCompareMock.mockResolvedValue(true);
            jwtSignMock
                .mockReturnValueOnce('access-token')
                .mockReturnValueOnce('refresh-token');

            const result = await manageCommonService.authenticateAccount({ email: 'a@x.com', password: 'good' });

            expect(jwtSignMock).toHaveBeenCalledTimes(2);
            expect(bcryptCompareMock).toHaveBeenCalledWith('good', 'hashed');
            expect(user.lastLoggedOn).toBeInstanceOf(Date);
            expect(user.refreshToken).toBe('refresh-token');
            expect(user.save).toHaveBeenCalledTimes(1);
            expect(result).toEqual({
                success: true,
                userRole: 'employee',
                id: 'u1',
                passwordResetRequired: 'false',
                applicationWalkThrough: 0,
                token: 'access-token',
                refreshToken: 'refresh-token',
                firstName: 'John',
                lastName: 'Doe'
            });
        });

        it('rejects with success false when the user lookup throws', async () => {
            findOneMock.mockRejectedValue(new Error('DB down'));

            await expect(
                manageCommonService.authenticateAccount({ email: 'a@x.com', password: 'pw' })
            ).rejects.toEqual({ success: false });
        });
    });

    describe('refreshToken', () => {
        it('returns a new token when the refresh token belongs to a user', async () => {
            jwtVerifyMock.mockReturnValue({ email: 'a@x.com', userId: 'u1', organizationId: 'org1' });
            findOneMock.mockResolvedValue({ _id: 'u1', refreshToken: 'refresh-token' });
            jwtSignMock.mockReturnValue('new-access-token');

            const result = await manageCommonService.refreshToken('refresh-token');

            expect(jwtVerifyMock).toHaveBeenCalledTimes(1);
            expect(jwtVerifyMock).toHaveBeenCalledWith('refresh-token', expect.anything());
            expect(findOneMock).toHaveBeenCalledWith({ _id: 'u1' });
            expect(result).toBe('new-access-token');
        });

        it('throws when no user matches the refresh token payload', async () => {
            jwtVerifyMock.mockReturnValue({ email: 'a@x.com', userId: 'u1', organizationId: 'org1' });
            findOneMock.mockResolvedValue(null);

            await expect(manageCommonService.refreshToken('refresh-token')).rejects.toThrow('Invalid user token');
        });

        it('throws when the stored refresh token is empty', async () => {
            jwtVerifyMock.mockReturnValue({ email: 'a@x.com', userId: 'u1', organizationId: 'org1' });
            findOneMock.mockResolvedValue({ _id: 'u1', refreshToken: '' });

            await expect(manageCommonService.refreshToken('refresh-token')).rejects.toThrow('Invalid user token');
        });

        it('throws when the token cannot be verified', async () => {
            jwtVerifyMock.mockImplementation(() => {
                throw new Error('jwt expired');
            });

            await expect(manageCommonService.refreshToken('bad-token')).rejects.toThrow('Invalid user token');
        });
    });

    describe('logout', () => {
        it('clears the refresh token for the user', async () => {
            findOneAndUpdateMock.mockResolvedValue({ _id: 'u1' });

            await manageCommonService.logout('u1');

            expect(findOneAndUpdateMock).toHaveBeenCalledTimes(1);
            expect(findOneAndUpdateMock).toHaveBeenCalledWith({ _id: 'u1' }, { $set: { refreshToken: '' } });
        });
    });
});