"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updatePasswordController_1 = __importDefault(require("../../../controllers/common/updatePasswordController"));
const updatePasswordService_1 = __importDefault(require("../../../services/common/updatePasswordService"));
jest.mock('../../../services/common/updatePasswordService', () => ({
    __esModule: true,
    default: { updatePassword: jest.fn() }
}));
const updatePasswordServiceMock = updatePasswordService_1.default.updatePassword;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('updatePasswordController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        updatePasswordServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the response when the password update succeeds', async () => {
        const req = {
            body: { oldPassword: 'old', newPassword: 'new' },
            user: { userId: 'u1' }
        };
        updatePasswordServiceMock.mockResolvedValue({ success: true, message: 'Password updated Successfully !' });
        await updatePasswordController_1.default.updatePassword(req, res);
        await flushMicrotasks();
        expect(updatePasswordServiceMock).toHaveBeenCalledTimes(1);
        expect(updatePasswordServiceMock).toHaveBeenCalledWith({
            oldPassword: 'old',
            newPassword: 'new',
            userId: 'u1'
        });
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({ success: true, message: 'Password updated Successfully !' });
    });
    it('returns 401 when the service reports a failure', async () => {
        const req = {
            body: { oldPassword: 'bad', newPassword: 'new' },
            user: { userId: 'u1' }
        };
        updatePasswordServiceMock.mockResolvedValue({ success: false, message: 'Temporary password is not matched !' });
        await updatePasswordController_1.default.updatePassword(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: 'Temporary password is not matched !' });
    });
    it('returns 500 when the service throws', async () => {
        const req = {
            body: { oldPassword: 'old', newPassword: 'new' },
            user: { userId: 'u1' }
        };
        updatePasswordServiceMock.mockRejectedValue(new Error('boom'));
        await updatePasswordController_1.default.updatePassword(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: 'Error occured while updating the password !' });
    });
});
