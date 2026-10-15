import { Request, Response } from 'express';
import registrationController from '../../../controllers/superadmin/registrationController';
import registerAdminBySuperAdminService from '../../../services/superadmin/registerAdminBySuperadminService';
import hashPasswordUtility from '../../../util/hashPassword';
import utilService from '../../../util/sendRegistrationOTPEmail';
import { ERRORS, ACCOUNT_MESSAGES } from '../../../constants/registrationMessages';

jest.mock('../../../services/superadmin/registerAdminBySuperadminService', () => ({
    __esModule: true,
    default: {
        isAccountPresent: jest.fn(),
        saveAccount: jest.fn()
    }
}));

jest.mock('../../../util/hashPassword', () => ({
    __esModule: true,
    default: {
        hashPassword: jest.fn()
    }
}));

jest.mock('../../../util/sendRegistrationOTPEmail', () => ({
    __esModule: true,
    default: {
        sendOTPEmail: jest.fn()
    }
}));

const isAccountPresentMock =
    registerAdminBySuperAdminService.isAccountPresent as unknown as jest.Mock;
const saveAccountMock =
    registerAdminBySuperAdminService.saveAccount as unknown as jest.Mock;
const hashPasswordMock =
    hashPasswordUtility.hashPassword as unknown as jest.Mock;
const sendOTPEmailMock =
    utilService.sendOTPEmail as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('registrationController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = {
            status: mockStatus,
            json: mockJson
        } as unknown as Response;
        isAccountPresentMock.mockReset();
        saveAccountMock.mockReset();
        hashPasswordMock.mockReset();
        sendOTPEmailMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('register', () => {
        it('returns 201 with success message when registration is successful', async () => {
            const req = {
                body: {
                    email: 'admin@x.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    organizationId: 'org1'
                }
            } as unknown as Request;
            isAccountPresentMock.mockResolvedValue(false);
            hashPasswordMock.mockResolvedValue('hashed-password');
            saveAccountMock.mockResolvedValue({ id: 'u1' });

            await registrationController.register(req, res);
            await flushMicrotasks();

            expect(isAccountPresentMock).toHaveBeenCalledWith('admin@x.com');
            expect(hashPasswordMock).toHaveBeenCalled();
            expect(saveAccountMock).toHaveBeenCalledTimes(1);
            expect(sendOTPEmailMock).toHaveBeenCalledWith('John', 'Doe', 'admin@x.com', expect.any(String));
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith({ message: ACCOUNT_MESSAGES.REGISTRATION_SUCCESS });
        });

        it('returns 409 when the email already exists', async () => {
            const req = {
                body: {
                    email: 'existing@x.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    organizationId: 'org1'
                }
            } as unknown as Request;
            isAccountPresentMock.mockResolvedValue(true);

            await registrationController.register(req, res);
            await flushMicrotasks();

            expect(isAccountPresentMock).toHaveBeenCalledWith('existing@x.com');
            expect(hashPasswordMock).not.toHaveBeenCalled();
            expect(saveAccountMock).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(409);
            expect(mockJson).toHaveBeenCalledWith({ message: ERRORS.EMAIL_EXISTS });
        });

        it('returns 500 when saveAccount throws', async () => {
            const req = {
                body: {
                    email: 'admin@x.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    organizationId: 'org1'
                }
            } as unknown as Request;
            isAccountPresentMock.mockResolvedValue(false);
            hashPasswordMock.mockResolvedValue('hashed-password');
            saveAccountMock.mockRejectedValue(new Error('DB error'));

            await registrationController.register(req, res);
            await flushMicrotasks();

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ message: ERRORS.USER_CREATION_ERROR });
        });

        it('sets passwordResetRequired, organization and applicationWalkThrough on registration data', async () => {
            const req = {
                body: {
                    email: 'admin@x.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    organizationId: 'org1'
                }
            } as unknown as Request;
            isAccountPresentMock.mockResolvedValue(false);
            hashPasswordMock.mockResolvedValue('hashed-password');
            saveAccountMock.mockResolvedValue({ id: 'u1' });

            await registrationController.register(req, res);
            await flushMicrotasks();

            const savedData = saveAccountMock.mock.calls[0][0];
            expect(savedData.passwordResetRequired).toBe(true);
            expect(savedData.organization).toBe('org1');
            expect(savedData.applicationWalkThrough).toBe(1);
            expect(savedData.isDeleted).toBe(false);
        });
    });
});
