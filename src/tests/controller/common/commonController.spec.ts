import { Request, Response } from 'express';
import commonController from '../../../controllers/common/commonController';
import commonServices from '../../../services/common/manageCommonService';
import { COMMON_ERRORS, LOGIN_ERROR_MESSAGE } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/common/manageCommonService', () => ({
    __esModule: true,
    default: {
        authenticateAccount: jest.fn(),
        createCSRFToken: jest.fn(),
        updateVisitorCount: jest.fn(),
        refreshToken: jest.fn(),
        logout: jest.fn()
    }
}));

const authenticateAccountMock =
    commonServices.authenticateAccount as unknown as jest.Mock;
const createCSRFTokenMock =
    commonServices.createCSRFToken as unknown as jest.Mock;
const updateVisitorCountMock =
    commonServices.updateVisitorCount as unknown as jest.Mock;
const refreshTokenMock =
    commonServices.refreshToken as unknown as jest.Mock;
const logoutMock =
    commonServices.logout as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('commonController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let mockSet: jest.Mock;
    let mockCookie: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        mockSet = jest.fn();
        mockCookie = jest.fn();
        res = {
            status: mockStatus,
            json: mockJson,
            set: mockSet,
            cookie: mockCookie
        } as unknown as Response;
        authenticateAccountMock.mockReset();
        createCSRFTokenMock.mockReset();
        updateVisitorCountMock.mockReset();
        refreshTokenMock.mockReset();
        logoutMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('login', () => {
        it('sets the csrf token, cookie and returns the auth payload on success', async () => {
            const req = { body: { email: 'a@x.com', password: 'pw' } } as unknown as Request;
            authenticateAccountMock.mockResolvedValue({
                success: true,
                id: 'u1',
                userRole: 'employee',
                passwordResetRequired: 'false',
                applicationWalkThrough: 0,
                token: 'access-token',
                refreshToken: 'refresh-token',
                firstName: 'John',
                lastName: 'Doe'
            });
            createCSRFTokenMock.mockResolvedValue('csrf-token');

            await commonController.login(req, res);
            await flushMicrotasks();

            expect(authenticateAccountMock).toHaveBeenCalledTimes(1);
            expect(authenticateAccountMock).toHaveBeenCalledWith({ email: 'a@x.com', password: 'pw' });
            expect(createCSRFTokenMock).toHaveBeenCalledTimes(1);
            expect(mockSet).toHaveBeenCalledWith('X-CSRF-Token', 'csrf-token');
            expect(mockCookie).toHaveBeenCalledWith('jwt', 'access-token');
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                id: 'u1',
                userRole: 'employee',
                passwordResetRequired: 'false',
                applicationWalkThrough: 0,
                token: 'access-token',
                refreshToken: 'refresh-token',
                firstName: 'John',
                lastName: 'Doe'
            });
        });

        it('returns 401 when the credentials are invalid', async () => {
            const req = { body: { email: 'a@x.com', password: 'bad' } } as unknown as Request;
            authenticateAccountMock.mockResolvedValue({ success: false });

            await commonController.login(req, res);
            await flushMicrotasks();

            expect(authenticateAccountMock).toHaveBeenCalledTimes(1);
            expect(createCSRFTokenMock).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: LOGIN_ERROR_MESSAGE.INVALID_EMAIL_PASSWORD
            });
        });

        it('returns 500 when authentication throws', async () => {
            const req = { body: { email: 'a@x.com', password: 'pw' } } as unknown as Request;
            authenticateAccountMock.mockRejectedValue(new Error('boom'));

            await commonController.login(req, res);
            await flushMicrotasks();

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: LOGIN_ERROR_MESSAGE.INTERNAL_SERVER_ERROR
            });
        });
    });

    describe('updateVisitorCount', () => {
        it('returns 200 with the visitor count on success', async () => {
            updateVisitorCountMock.mockResolvedValue(9);

            await commonController.updateVisitorCount({} as Request, res);
            await flushMicrotasks();

            expect(updateVisitorCountMock).toHaveBeenCalledTimes(1);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({ visitorCount: 9 });
        });

        it('returns 500 with the updating error when it throws', async () => {
            updateVisitorCountMock.mockRejectedValue(new Error('boom'));

            await commonController.updateVisitorCount({} as Request, res);
            await flushMicrotasks();

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: COMMON_ERRORS.VISITORS_COUNT_UPDATING_ERROR
            });
        });
    });

    describe('refreshToken', () => {
        it('returns 401 when no refresh token header is present', async () => {
            const req = { headers: {} } as unknown as Request;

            await commonController.refreshToken(req, res);

            expect(refreshTokenMock).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ message: 'No refresh token. Please log in again.' });
        });

        it('returns 200 with the new token on success', async () => {
            const req = { headers: { refresh_token: 'refresh-token' } } as unknown as Request;
            refreshTokenMock.mockResolvedValue('new-access-token');

            await commonController.refreshToken(req, res);
            await flushMicrotasks();

            expect(refreshTokenMock).toHaveBeenCalledWith('refresh-token');
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({ token: 'new-access-token' });
        });

        it('returns 403 with invalid user token when it throws', async () => {
            const req = { headers: { refresh_token: 'bad-token' } } as unknown as Request;
            refreshTokenMock.mockRejectedValue('Invalid user token');

            await commonController.refreshToken(req, res);
            await flushMicrotasks();

            expect(mockStatus).toHaveBeenCalledWith(403);
            expect(mockJson).toHaveBeenCalledWith({ success: false, message: 'Invalid user token' });
        });
    });

    describe('logout', () => {
        it('returns 200 with a success message after clearing the refresh token', async () => {
            const req = { user: { userId: 'u1' } } as unknown as Request;
            logoutMock.mockResolvedValue(undefined);

            await commonController.logout(req, res);
            await flushMicrotasks();

            expect(logoutMock).toHaveBeenCalledTimes(1);
            expect(logoutMock).toHaveBeenCalledWith('u1');
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({ success: true, message: 'Successfully logged out' });
        });
    it('calls logout with undefined when the request has no user', async () => {
            const req = {} as unknown as Request;
            logoutMock.mockResolvedValue(undefined);

            await commonController.logout(req, res);
            await flushMicrotasks();

            expect(logoutMock).toHaveBeenCalledWith(undefined);
            expect(mockStatus).toHaveBeenCalledWith(200);
        });
    });
});