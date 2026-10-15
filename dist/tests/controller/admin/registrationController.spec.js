"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const registrationController_1 = __importDefault(require("../../../controllers/admin/registrationController"));
const registerEmployeeByAdminService_1 = __importDefault(require("../../../services/admin/registerEmployeeByAdminService"));
const sendRegistrationOTPEmail_1 = __importDefault(require("../../../util/sendRegistrationOTPEmail"));
const hashPassword_1 = __importDefault(require("../../../util/hashPassword"));
const registrationMessages_1 = require("../../../constants/registrationMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
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
const isAccountPresentMock = registerEmployeeByAdminService_1.default.isAccountPresent;
const saveAccountMock = registerEmployeeByAdminService_1.default.saveAccount;
const sendOTPEmailMock = sendRegistrationOTPEmail_1.default.sendOTPEmail;
const hashPasswordMock = hashPassword_1.default.hashPassword;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('registration controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        isAccountPresentMock.mockReset();
        saveAccountMock.mockReset();
        sendOTPEmailMock.mockReset();
        sendOTPEmailMock.mockResolvedValue(undefined);
        hashPasswordMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('registers a new account and returns 201 with the success message', async () => {
        const req = {
            body: { firstName: 'John', lastName: 'Doe', email: 'a@x.com' },
            user: { organizationId: 'org1' }
        };
        isAccountPresentMock.mockResolvedValue(false);
        hashPasswordMock.mockResolvedValue('hashed-password');
        saveAccountMock.mockResolvedValue({ _id: 'u1', id: 'u1' });
        await registrationController_1.default.register(req, res);
        await flushMicrotasks();
        const registrationData = req.body;
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
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({ message: registrationMessages_1.ACCOUNT_MESSAGES.REGISTRATION_SUCCESS });
    });
    it('returns 409 when the email already exists', async () => {
        const req = {
            body: { firstName: 'John', lastName: 'Doe', email: 'a@x.com' },
            user: { organizationId: 'org1' }
        };
        isAccountPresentMock.mockResolvedValue(true);
        await registrationController_1.default.register(req, res);
        await flushMicrotasks();
        expect(hashPasswordMock).not.toHaveBeenCalled();
        expect(saveAccountMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.CONFLICT);
        expect(mockJson).toHaveBeenCalledWith({ message: registrationMessages_1.ERRORS.EMAIL_EXISTS });
    });
    it('returns 500 with the creation error when saving the account fails', async () => {
        const req = {
            body: { firstName: 'John', lastName: 'Doe', email: 'a@x.com' },
            user: { organizationId: 'org1' }
        };
        isAccountPresentMock.mockResolvedValue(false);
        hashPasswordMock.mockResolvedValue('hashed-password');
        saveAccountMock.mockRejectedValue(new Error('Save failure'));
        await registrationController_1.default.register(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({ message: registrationMessages_1.ERRORS.USER_CREATION_ERROR });
    });
    it('skips the OTP email when the saved account has no id', async () => {
        const req = {
            body: { firstName: 'John', lastName: 'Doe', email: 'a@x.com' },
            user: { organizationId: 'org1' }
        };
        isAccountPresentMock.mockResolvedValue(false);
        hashPasswordMock.mockResolvedValue('hashed-password');
        saveAccountMock.mockResolvedValue({});
        await registrationController_1.default.register(req, res);
        await flushMicrotasks();
        expect(sendOTPEmailMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({ message: registrationMessages_1.ACCOUNT_MESSAGES.REGISTRATION_SUCCESS });
    });
});
