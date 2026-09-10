import { Request, Response } from 'express';
import registrationController from '../../../controllers/admin/registrationController';
import adminSignUpService from '../../../services/admin/registerEmployeeByAdminService';
import utilService from '../../../util/sendRegistrationOTPEmail';
import hashPasswordUtility from '../../../util/hashPassword';
import { ERRORS, ACCOUNT_MESSAGES } from '../../../constants/registrationMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/registerEmployeeByAdminService', () => ({
    __esModule: true,
    default: {
        isAccountPresent: jest.fn(),
        saveAccount: jest.fn()
    }
}));

jest.mock('../../../util/sendRegistrationOTPEmail', () => ({
    __esModule: true,
    default: { sendOTPEmail: jest.fn() }
}));

jest.mock('../../../util/hashPassword', () => ({
    __esModule: true,
    default: { hashPassword: jest.fn() }
}));

const isAccountPresentMock = adminSignUpService.isAccountPresent as unknown as jest.Mock;
const saveAccountMock = adminSignUpService.saveAccount as unknown as jest.Mock;
const sendOTPEmailMock = utilService.sendOTPEmail as unknown as jest.Mock;
const hashPasswordMock = hashPasswordUtility.hashPassword as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('registration controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        isAccountPresentMock.mockReset();
        saveAccountMock.mockReset();
        sendOTPEmailMock.mockReset();
        sendOTPEmailMock.mockResolvedValue(undefined);
        hashPasswordMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('registers a new account and returns 201 with the success message', async () => {
        const req = {
            body: { firstName: 'John', lastName: 'Doe', email: 'a@x.com' },
            user: { organizationId: 'org1' }
        } as unknown as Request;
        isAccountPresentMock.mockResolvedValue(false);
        hashPasswordMock.mockResolvedValue('hashed-password');
        saveAccountMock.mockResolvedValue({ _id: 'u1', id: 'u1' });

        await registrationController.register(req, res);
        await flushMicrotasks();

        const registrationData = req.body as any;
        expect(isAccountPresentMock).toHaveBeenCalledTimes(1);
        expect(isAccountPresentMock).toHaveBeenCalledWith('a@x.com');
        expect(registrationData.passwordResetRequired).toBe(true);
        expect(registrationData.organization).toBe('org1');
        expect(registrationData.applicationWalkThrough).toBe(1);
        expect(registrationData.isDeleted).toBe(false);
        expect(registrationData.password).toBe('hashed-password');
        expect(hashPasswordMock).toHaveBeenCalledTimes(1);
        const randomPassword = hashPasswordMock.mock.calls[0][0];
        expect(randomPassword).toMatch(/^\d{8}$/);
        expect(saveAccountMock).toHaveBeenCalledTimes(1);
        expect(saveAccountMock).toHaveBeenCalledWith(registrationData);
        expect(sendOTPEmailMock).toHaveBeenCalledTimes(1);
        expect(sendOTPEmailMock).toHaveBeenCalledWith('John', 'Doe', 'a@x.com', randomPassword);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({ message: ACCOUNT_MESSAGES.REGISTRATION_SUCCESS });
    });

    it('returns 409 when the email already exists', async () => {
        const req = {
            body: { firstName: 'John', lastName: 'Doe', email: 'a@x.com' },
            user: { organizationId: 'org1' }
        } as unknown as Request;
        isAccountPresentMock.mockResolvedValue(true);

        await registrationController.register(req, res);
        await flushMicrotasks();

        expect(hashPasswordMock).not.toHaveBeenCalled();
        expect(saveAccountMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CONFLICT);
        expect(mockJson).toHaveBeenCalledWith({ message: ERRORS.EMAIL_EXISTS });
    });

    it('returns 500 with the creation error when saving the account fails', async () => {
        const req = {
            body: { firstName: 'John', lastName: 'Doe', email: 'a@x.com' },
            user: { organizationId: 'org1' }
        } as unknown as Request;
        isAccountPresentMock.mockResolvedValue(false);
        hashPasswordMock.mockResolvedValue('hashed-password');
        saveAccountMock.mockRejectedValue(new Error('Save failure'));

        await registrationController.register(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({ message: ERRORS.USER_CREATION_ERROR });
    });

    it('skips the OTP email when the saved account has no id', async () => {
        const req = {
            body: { firstName: 'John', lastName: 'Doe', email: 'a@x.com' },
            user: { organizationId: 'org1' }
        } as unknown as Request;
        isAccountPresentMock.mockResolvedValue(false);
        hashPasswordMock.mockResolvedValue('hashed-password');
        saveAccountMock.mockResolvedValue({});

        await registrationController.register(req, res);
        await flushMicrotasks();

        expect(sendOTPEmailMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({ message: ACCOUNT_MESSAGES.REGISTRATION_SUCCESS });
    });
});