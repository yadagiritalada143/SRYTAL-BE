import getUserDetailsByAdminService from '../../../services/admin/getUserDetailsByAdminService';
import UserModel from '../../../model/userModel';

jest.mock('../../../model/userModel', () => {
    const UserModel = jest.fn();
    (UserModel as any).findOne = jest.fn();
    return { __esModule: true, default: UserModel };
});

const UserModelMock = UserModel as unknown as jest.Mock & { findOne: jest.Mock };

const buildFindOneChain = (mock: jest.Mock, finalValue: any) => {
    const chain: any = {
        populate: jest.fn(function () { return this; }),
    };
    chain.then = (onFulfilled: any, onRejected: any) => {
        if (finalValue instanceof Error) {
            if (onRejected) return Promise.resolve(onRejected(finalValue));
            return Promise.reject(finalValue);
        }
        if (onFulfilled) return Promise.resolve(onFulfilled(finalValue));
        return Promise.resolve(finalValue);
    };
    chain.catch = (onRejected: any) => Promise.resolve(onRejected(finalValue));
    mock.mockReturnValue(chain);
    return chain;
};

describe('getUserDetailsByAdminService', () => {
    beforeEach(() => {
        UserModelMock.mockReset();
        UserModelMock.findOne = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => {});
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

        const result = await getUserDetailsByAdminService.getEmployeeDetailsByAdmin('u1');

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

        const result = await getUserDetailsByAdminService.getEmployeeDetailsByAdmin('u2');

        expect(result.success).toBe(true);
        expect((result.userDetails as any).dateOfBirth).toBeNull();
        expect((result.userDetails as any).dateOfJoining).toBeNull();
    });

    it('rejects with { success: false } when the user is not found', async () => {
        buildFindOneChain(UserModelMock.findOne, null);

        await expect(getUserDetailsByAdminService.getEmployeeDetailsByAdmin('missing')).rejects.toEqual({ success: false });
    });

    it('rejects with { success: false } and logs when the query fails', async () => {
        buildFindOneChain(UserModelMock.findOne, new Error('query failed'));

        await expect(getUserDetailsByAdminService.getEmployeeDetailsByAdmin('u1')).rejects.toEqual({ success: false });
        expect(console.error).toHaveBeenCalled();
    });
});