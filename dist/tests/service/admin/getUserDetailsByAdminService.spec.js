"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getUserDetailsByAdminService_1 = __importDefault(require("../../../services/admin/getUserDetailsByAdminService"));
const userModel_1 = __importDefault(require("../../../model/userModel"));
jest.mock('../../../model/userModel', () => {
    const UserModel = jest.fn();
    UserModel.findOne = jest.fn();
    return { __esModule: true, default: UserModel };
});
const UserModelMock = userModel_1.default;
const buildFindOneChain = (mock, finalValue) => {
    const chain = {
        populate: jest.fn(function () { return this; }),
    };
    chain.then = (onFulfilled, onRejected) => {
        if (finalValue instanceof Error) {
            if (onRejected)
                return Promise.resolve(onRejected(finalValue));
            return Promise.reject(finalValue);
        }
        if (onFulfilled)
            return Promise.resolve(onFulfilled(finalValue));
        return Promise.resolve(finalValue);
    };
    chain.catch = (onRejected) => Promise.resolve(onRejected(finalValue));
    mock.mockReturnValue(chain);
    return chain;
};
describe('getUserDetailsByAdminService', () => {
    beforeEach(() => {
        UserModelMock.mockReset();
        UserModelMock.findOne = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('resolves with the user details when the user is found', async () => {
        const user = {
            id: 'u1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'a@x.com',
            mobileNumber: '999',
            bloodGroup: 'O+',
            bankDetailsInfo: {},
            employmentType: 'Full-time',
            employeeRole: 'Admin',
            organization: 'org1',
            employeeId: 'EMP-1',
            dateOfBirth: new Date('1990-01-15T00:00:00Z'),
            aadharNumber: '1111',
            panCardNumber: 'PAN1',
            dateOfJoining: new Date('2024-03-10T00:00:00Z'),
            uanNumber: 'UAN1',
            department: 'IT',
            presentAddress: 'Addr1',
            permanentAddress: 'Addr2'
        };
        buildFindOneChain(UserModelMock.findOne, user);
        const result = await getUserDetailsByAdminService_1.default.getEmployeeDetailsByAdmin('u1');
        expect(UserModelMock.findOne).toHaveBeenCalledWith({ _id: 'u1' });
        expect(result).toEqual({
            success: true,
            userDetails: {
                id: 'u1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'a@x.com',
                mobileNumber: '999',
                bloodGroup: 'O+',
                bankDetailsInfo: {},
                employmentType: 'Full-time',
                employeeRole: 'Admin',
                organization: 'org1',
                employeeId: 'EMP-1',
                dateOfBirth: '15-Jan-1990',
                aadharNumber: '1111',
                panCardNumber: 'PAN1',
                dateOfJoining: '10-Mar-2024',
                uanNumber: 'UAN1',
                department: 'IT',
                presentAddress: 'Addr1',
                permanentAddress: 'Addr2'
            }
        });
    });
    it('maps missing and invalid dates to null', async () => {
        const user = {
            id: 'u2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'b@x.com',
            mobileNumber: '888',
            dateOfBirth: undefined,
            dateOfJoining: 'not-a-date'
        };
        buildFindOneChain(UserModelMock.findOne, user);
        const result = await getUserDetailsByAdminService_1.default.getEmployeeDetailsByAdmin('u2');
        expect(result.success).toBe(true);
        expect(result.userDetails.dateOfBirth).toBeNull();
        expect(result.userDetails.dateOfJoining).toBeNull();
    });
    it('rejects with { success: false } when the user is not found', async () => {
        buildFindOneChain(UserModelMock.findOne, null);
        await expect(getUserDetailsByAdminService_1.default.getEmployeeDetailsByAdmin('missing')).rejects.toEqual({ success: false });
    });
    it('rejects with { success: false } and logs when the query fails', async () => {
        buildFindOneChain(UserModelMock.findOne, new Error('query failed'));
        await expect(getUserDetailsByAdminService_1.default.getEmployeeDetailsByAdmin('u1')).rejects.toEqual({ success: false });
        expect(console.error).toHaveBeenCalled();
    });
});
