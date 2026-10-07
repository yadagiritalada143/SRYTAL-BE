"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllEmployeeDetailsByAdminService_1 = __importDefault(require("../../../services/admin/getAllEmployeeDetailsByAdminService"));
const userModel_1 = __importDefault(require("../../../model/userModel"));
jest.mock('../../../model/userModel', () => {
    const UserModel = jest.fn();
    UserModel.find = jest.fn();
    return { __esModule: true, default: UserModel };
});
const UserModelMock = userModel_1.default;
const buildFindChain = (mock, users) => {
    const chain = {
        populate: jest.fn(function () { return this; }),
    };
    chain.then = (onFulfilled) => {
        onFulfilled(users);
    };
    mock.mockReturnValue(chain);
    return chain;
};
describe('getAllEmployeeDetailsByAdminService', () => {
    beforeEach(() => {
        UserModelMock.mockReset();
        UserModelMock.find = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('maps the fetched users into the employee details payload', async () => {
        const users = [
            {
                id: 'u1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'a@x.com',
                mobileNumber: '999',
                bloodGroup: 'O+',
                bankDetailsInfo: { bankName: 'HDFC' },
                employmentType: 'Full-time',
                employeeRole: 'Admin',
                organization: 'org1',
                userRole: 'Admin',
                passwordResetRequired: false,
                employeeId: 'EMP-1',
                dateOfBirth: new Date('1990-01-05T00:00:00Z'),
                aadharNumber: '1111',
                panCardNumber: 'PAN1',
                dateOfJoining: new Date('2024-02-20T00:00:00Z'),
                uanNumber: 'UAN1',
                department: 'IT',
                presentAddress: 'A1',
                permanentAddress: 'A2'
            },
            {
                id: 'u2',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'b@x.com',
                mobileNumber: '888',
                dateOfBirth: undefined,
                dateOfJoining: 'broken-date'
            }
        ];
        const chain = buildFindChain(UserModelMock.find, users);
        const result = await getAllEmployeeDetailsByAdminService_1.default.getAllEmployeeDetailsByAdmin('org1', 'adminId');
        expect(UserModelMock.find).toHaveBeenCalledWith({
            organization: 'org1',
            _id: { $ne: 'adminId' },
            isDeleted: false
        });
        expect(chain.populate).toHaveBeenCalledTimes(5);
        expect(result).toEqual({
            success: true,
            usersList: [
                {
                    id: 'u1',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'a@x.com',
                    mobileNumber: '999',
                    bloodGroup: 'O+',
                    bankDetailsInfo: { bankName: 'HDFC' },
                    employmentType: 'Full-time',
                    employeeRole: 'Admin',
                    organization: 'org1',
                    userRole: 'Admin',
                    passwordResetRequired: false,
                    employeeId: 'EMP-1',
                    dateOfBirth: '05-Jan-1990',
                    aadharNumber: '1111',
                    panCardNumber: 'PAN1',
                    dateOfJoining: '20-Feb-2024',
                    uanNumber: 'UAN1',
                    department: 'IT',
                    presentAddress: 'A1',
                    permanentAddress: 'A2'
                },
                {
                    id: 'u2',
                    firstName: 'Jane',
                    lastName: 'Smith',
                    email: 'b@x.com',
                    mobileNumber: '888',
                    bloodGroup: undefined,
                    bankDetailsInfo: undefined,
                    employmentType: undefined,
                    employeeRole: undefined,
                    organization: undefined,
                    userRole: undefined,
                    passwordResetRequired: undefined,
                    employeeId: undefined,
                    dateOfBirth: null,
                    aadharNumber: undefined,
                    panCardNumber: undefined,
                    dateOfJoining: null,
                    uanNumber: undefined,
                    department: undefined,
                    presentAddress: undefined,
                    permanentAddress: undefined
                }
            ]
        });
    });
    it('returns { success: false } when the find result is falsy', async () => {
        buildFindChain(UserModelMock.find, null);
        const result = await getAllEmployeeDetailsByAdminService_1.default.getAllEmployeeDetailsByAdmin('org1', 'adminId');
        expect(result).toEqual({ success: false });
    });
    it('throws { success: false } and logs when the query fails', async () => {
        UserModelMock.find.mockImplementation(() => {
            throw new Error('query failed');
        });
        await expect(getAllEmployeeDetailsByAdminService_1.default.getAllEmployeeDetailsByAdmin('org1', 'adminId'))
            .rejects.toEqual({ success: false });
        expect(console.error).toHaveBeenCalled();
    });
});
