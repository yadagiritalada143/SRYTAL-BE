"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllEmployeesBySuperadminService_1 = __importDefault(require("../../../services/superadmin/getAllEmployeesBySuperadminService"));
const userModel_1 = __importDefault(require("../../../model/userModel"));
jest.mock('../../../model/userModel', () => {
    const UserModel = jest.fn();
    UserModel.find = jest.fn();
    return { __esModule: true, default: UserModel };
});
const UserModelMock = userModel_1.default;
const buildFindChain = (mock, users, shouldReject = false) => {
    const thenChain = {};
    const chain = {};
    chain.then = (onFulfilled) => {
        if (!shouldReject) {
            onFulfilled(users);
        }
        return thenChain;
    };
    thenChain.catch = (onRejected) => {
        if (shouldReject) {
            onRejected(users);
        }
    };
    mock.mockReturnValue(chain);
    return chain;
};
describe('getAllEmployeesBySuperadminService', () => {
    beforeEach(() => {
        UserModelMock.mockReset();
        UserModelMock.find = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns success with employee list when users are found', async () => {
        const users = [
            { _id: 'u1', firstName: 'John', lastName: 'Doe' },
            { _id: 'u2', firstName: 'Jane', lastName: 'Smith' }
        ];
        buildFindChain(UserModelMock.find, users);
        const result = await getAllEmployeesBySuperadminService_1.default.getAllEmployeesBySuperadmin('org1');
        expect(UserModelMock.find).toHaveBeenCalledWith({ organization: 'org1' });
        expect(result).toEqual({
            success: true,
            superadminEmployeeList: users
        });
    });
    it('rejects with success false when users is null', async () => {
        buildFindChain(UserModelMock.find, null);
        await expect(getAllEmployeesBySuperadminService_1.default.getAllEmployeesBySuperadmin('org1'))
            .rejects.toEqual({ success: false });
    });
    it('rejects with success false and logs when the query fails', async () => {
        buildFindChain(UserModelMock.find, new Error('DB error'), true);
        await expect(getAllEmployeesBySuperadminService_1.default.getAllEmployeesBySuperadmin('org1'))
            .rejects.toEqual({ success: false });
        expect(console.error).toHaveBeenCalled();
    });
});
