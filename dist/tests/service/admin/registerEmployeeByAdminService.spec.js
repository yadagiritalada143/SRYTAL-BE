"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const registerEmployeeByAdminService_1 = __importDefault(require("../../../services/admin/registerEmployeeByAdminService"));
const userModel_1 = __importDefault(require("../../../model/userModel"));
jest.mock('../../../model/userModel', () => {
    const UserModel = jest.fn();
    UserModel.findOne = jest.fn();
    return { __esModule: true, default: UserModel };
});
const UserModelMock = userModel_1.default;
describe('registerEmployeeByAdminService', () => {
    let saveSpy;
    beforeEach(() => {
        UserModelMock.mockReset();
        UserModelMock.findOne = jest.fn();
        saveSpy = jest.fn();
        UserModelMock.mockReturnValue({ save: saveSpy });
    });
    describe('isAccountPresent', () => {
        it('returns true when a user with the email exists', async () => {
            UserModelMock.findOne.mockResolvedValue({ _id: 'u1', email: 'a@x.com' });
            const result = await registerEmployeeByAdminService_1.default.isAccountPresent('a@x.com');
            expect(UserModelMock.findOne).toHaveBeenCalledTimes(1);
            expect(UserModelMock.findOne).toHaveBeenCalledWith({ email: 'a@x.com' });
            expect(result).toBe(true);
        });
        it('returns false when no user matches the email', async () => {
            UserModelMock.findOne.mockResolvedValue(null);
            const result = await registerEmployeeByAdminService_1.default.isAccountPresent('b@x.com');
            expect(UserModelMock.findOne).toHaveBeenCalledTimes(1);
            expect(UserModelMock.findOne).toHaveBeenCalledWith({ email: 'b@x.com' });
            expect(result).toBe(false);
        });
    });
    describe('saveAccount', () => {
        it('saves the user data and returns the result', async () => {
            const userData = { email: 'a@x.com', password: 'hashed' };
            const saved = Object.assign({ _id: 'u1' }, userData);
            saveSpy.mockResolvedValue(saved);
            const result = await registerEmployeeByAdminService_1.default.saveAccount(userData);
            expect(UserModelMock).toHaveBeenCalledTimes(1);
            expect(UserModelMock).toHaveBeenCalledWith(Object.assign({}, userData));
            expect(saveSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual(saved);
        });
        it('propagates errors thrown by save', async () => {
            const saveError = new Error('Save failed');
            saveSpy.mockRejectedValue(saveError);
            await expect(registerEmployeeByAdminService_1.default.saveAccount({ email: 'a@x.com' })).rejects.toThrow(saveError);
            expect(UserModelMock).toHaveBeenCalledTimes(1);
        });
    });
});
