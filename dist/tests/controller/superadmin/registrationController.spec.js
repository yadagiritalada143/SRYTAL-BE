"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const registrationController_1 = __importDefault(require("../../../controllers/superadmin/registrationController"));
const registerAdminBySuperadminService_1 = __importDefault(require("../../../services/superadmin/registerAdminBySuperadminService"));
const hashPassword_1 = __importDefault(require("../../../util/hashPassword"));
const sendRegistrationOTPEmail_1 = __importDefault(require("../../../util/sendRegistrationOTPEmail"));
const registrationMessages_1 = require("../../../constants/registrationMessages");
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
const isAccountPresentMock = registerAdminBySuperadminService_1.default.isAccountPresent;
const saveAccountMock = registerAdminBySuperadminService_1.default.saveAccount;
const hashPasswordMock = hashPassword_1.default.hashPassword;
const sendOTPEmailMock = sendRegistrationOTPEmail_1.default.sendOTPEmail;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('registrationController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = {
            status: mockStatus,
            json: mockJson
        };
        isAccountPresentMock.mockReset();
        saveAccountMock.mockReset();
        hashPasswordMock.mockReset();
        sendOTPEmailMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
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
            };
            isAccountPresentMock.mockResolvedValue(false);
            hashPasswordMock.mockResolvedValue('hashed-password');
            saveAccountMock.mockResolvedValue({ id: 'u1' });
            await registrationController_1.default.register(req, res);
            await flushMicrotasks();
            expect(isAccountPresentMock).toHaveBeenCalledWith('admin@x.com');
            expect(hashPasswordMock).toHaveBeenCalled();
            expect(saveAccountMock).toHaveBeenCalledTimes(1);
            expect(sendOTPEmailMock).toHaveBeenCalledWith('John', 'Doe', 'admin@x.com', expect.any(String));
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith({ message: registrationMessages_1.ACCOUNT_MESSAGES.REGISTRATION_SUCCESS });
        });
        it('returns 409 when the email already exists', async () => {
            const req = {
                body: {
                    email: 'existing@x.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    organizationId: 'org1'
                }
            };
            isAccountPresentMock.mockResolvedValue(true);
            await registrationController_1.default.register(req, res);
            await flushMicrotasks();
            expect(isAccountPresentMock).toHaveBeenCalledWith('existing@x.com');
            expect(hashPasswordMock).not.toHaveBeenCalled();
            expect(saveAccountMock).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(409);
            expect(mockJson).toHaveBeenCalledWith({ message: registrationMessages_1.ERRORS.EMAIL_EXISTS });
        });
        it('returns 500 when saveAccount throws', async () => {
            const req = {
                body: {
                    email: 'admin@x.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    organizationId: 'org1'
                }
            };
            isAccountPresentMock.mockResolvedValue(false);
            hashPasswordMock.mockResolvedValue('hashed-password');
            saveAccountMock.mockRejectedValue(new Error('DB error'));
            await registrationController_1.default.register(req, res);
            await flushMicrotasks();
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ message: registrationMessages_1.ERRORS.USER_CREATION_ERROR });
        });
        it('sets passwordResetRequired, organization and applicationWalkThrough on registration data', async () => {
            const req = {
                body: {
                    email: 'admin@x.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    organizationId: 'org1'
                }
            };
            isAccountPresentMock.mockResolvedValue(false);
            hashPasswordMock.mockResolvedValue('hashed-password');
            saveAccountMock.mockResolvedValue({ id: 'u1' });
            await registrationController_1.default.register(req, res);
            await flushMicrotasks();
            const savedData = saveAccountMock.mock.calls[0][0];
            expect(savedData.passwordResetRequired).toBe(true);
            expect(savedData.organization).toBe('org1');
            expect(savedData.applicationWalkThrough).toBe(1);
            expect(savedData.isDeleted).toBe(false);
        });
    });
});
