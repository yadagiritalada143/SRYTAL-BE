"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forgotPasswordController_1 = __importDefault(require("../../../controllers/common/forgotPasswordController"));
const forgotPasswordService_1 = __importDefault(require("../../../services/common/forgotPasswordService"));
jest.mock('../../../services/common/forgotPasswordService', () => ({
    __esModule: true,
    default: { forgotPassword: jest.fn() }
}));
const forgotPasswordServiceMock = forgotPasswordService_1.default.forgotPassword;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('forgotPasswordController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        forgotPasswordServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 when the password reset email is sent', async () => {
        const req = { body: { username: 'john@example.com' } };
        const successResponse = { success: true, message: 'Email sent' };
        forgotPasswordServiceMock.mockResolvedValue(successResponse);
        await forgotPasswordController_1.default.forgotPassword(req, res);
        await flushMicrotasks();
        expect(forgotPasswordServiceMock).toHaveBeenCalledWith('john@example.com');
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith(successResponse);
    });
    it('returns 401 when the service reports a failure', async () => {
        const req = { body: { username: 'john@example.com' } };
        const failureResponse = { success: false, message: 'User not Exists !' };
        forgotPasswordServiceMock.mockResolvedValue(failureResponse);
        await forgotPasswordController_1.default.forgotPassword(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith(failureResponse);
    });
    it('returns 500 when the service throws', async () => {
        const req = { body: { username: 'john@example.com' } };
        forgotPasswordServiceMock.mockRejectedValue(new Error('boom'));
        await forgotPasswordController_1.default.forgotPassword(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: 'Error occured in forgot password flow !'
        });
    });
});
