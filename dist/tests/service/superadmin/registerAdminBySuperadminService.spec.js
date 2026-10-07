"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const registerAdminBySuperadminService_1 = __importDefault(require("../../../services/superadmin/registerAdminBySuperadminService"));
const userModel_1 = __importDefault(require("../../../model/userModel"));
jest.mock('../../../model/userModel', () => {
    const UserModel = jest.fn();
    UserModel.findOne = jest.fn();
    return { __esModule: true, default: UserModel };
});
const UserModelMock = userModel_1.default;
describe('registerAdminBySuperadminService', () => {
    let saveSpy;
    beforeEach(() => {
        UserModelMock.mockReset();
        UserModelMock.findOne = jest.fn();
        saveSpy = jest.fn();
        UserModelMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe('isAccountPresent', () => {
        it('returns true when a user with the email exists', async () => {
            const chain = {};
            chain.then = (onFulfilled) => {
                return onFulfilled({ _id: 'u1', email: 'admin@x.com' });
            };
            UserModelMock.findOne.mockReturnValue(chain);
            const result = await registerAdminBySuperadminService_1.default.isAccountPresent('admin@x.com');
            expect(UserModelMock.findOne).toHaveBeenCalledWith({ email: 'admin@x.com' });
            expect(result).toBe(true);
        });
        it('returns false when no user with the email exists', async () => {
            const chain = {};
            chain.then = (onFulfilled) => {
                return onFulfilled(null);
            };
            UserModelMock.findOne.mockReturnValue(chain);
            const result = await registerAdminBySuperadminService_1.default.isAccountPresent('new@x.com');
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
            const savedUser = Object.assign({ _id: 'u1' }, userData);
            saveSpy.mockResolvedValue(savedUser);
            const result = await registerAdminBySuperadminService_1.default.saveAccount(userData);
            expect(UserModelMock).toHaveBeenCalledTimes(1);
            expect(UserModelMock).toHaveBeenCalledWith(userData);
            expect(saveSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual(savedUser);
        });
        it('propagates the error when save fails', async () => {
            const userData = { email: 'admin@x.com' };
            saveSpy.mockRejectedValue(new Error('DB error'));
            await expect(registerAdminBySuperadminService_1.default.saveAccount(userData))
                .rejects.toThrow('DB error');
        });
    });
});
