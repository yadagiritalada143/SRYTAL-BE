import getEmployeeDetailsService from '../../../services/common/getEmployeeDetailsService';
import UserModel from '../../../model/userModel';

jest.mock('../../../model/userModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));

const findOneMock = (UserModel as unknown as { findOne: jest.Mock }).findOne;

const buildChain = (employee: any, error?: Error) => {
    const chain: any = {
        populate: jest.fn().mockImplementation(() => chain)
    };
    chain.then = (onFulfilled: any) => {
        if (error) {
            return Promise.reject(error);
        }
        return Promise.resolve(employee).then(onFulfilled);
    };
    return chain;
};

describe('getEmployeeDetailsService', () => {
    beforeEach(() => {
        findOneMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const employee = {
        id: 'u1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        mobileNumber: '1234567890',
        bloodGroup: { bloodGroup: 'O+' },
        bankDetailsInfo: { accountNumber: '123' },
        employeeRole: [{}],
        employmentType: { employmentType: 'Full Time' },
        organization: { organizationName: 'Acme' },
        userRole: 'employee',
        passwordResetRequired: 'false',
        employeeId: 'EMP-1',
        dateOfBirth: new Date(2026, 6, 8, 10, 0, 0),
        presentAddress: 'Addr',
        permanentAddress: 'PAddr',
        aadharNumber: '111',
        panCardNumber: '222',
        uanNumber: '333',
        department: { departmentName: 'Engg' },
        dateOfJoining: new Date(2026, 0, 5, 9, 0, 0)
    };

    it('returns the formatted employee details when the employee exists', async () => {
        findOneMock.mockReturnValue(buildChain(employee));

        const result = await getEmployeeDetailsService.getEmployeeDetails('u1');

        expect(findOneMock).toHaveBeenCalledWith({ _id: 'u1' });
        expect(result).toEqual({
            success: true,
            employeeDetails: {
                id: 'u1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                mobileNumber: '1234567890',
                bloodGroup: { bloodGroup: 'O+' },
                bankDetailsInfo: { accountNumber: '123' },
                employeeRole: [{}],
                employmentType: { employmentType: 'Full Time' },
                organization: { organizationName: 'Acme' },
                userRole: 'employee',
                passwordResetRequired: 'false',
                employeeId: 'EMP-1',
                dateOfBirth: '08-Jul-2026',
                presentAddress: 'Addr',
                permanentAddress: 'PAddr',
                aadharNumber: '111',
                panCardNumber: '222',
                uanNumber: '333',
                department: { departmentName: 'Engg' },
                dateOfJoining: '05-Jan-2026'
            }
        });
    });

    it('returns null dates for missing or invalid dates', async () => {
        const employeeWithBadDates = {
            ...employee,
            dateOfBirth: new Date('not-a-date'),
            dateOfJoining: undefined
        };
        findOneMock.mockReturnValue(buildChain(employeeWithBadDates));

        const result = await getEmployeeDetailsService.getEmployeeDetails('u1');

        expect(result.employeeDetails.dateOfBirth).toBeNull();
        expect(result.employeeDetails.dateOfJoining).toBeNull();
    });

    it('rejects with success false when the employee does not exist', async () => {
        findOneMock.mockReturnValue(buildChain(null));

        await expect(getEmployeeDetailsService.getEmployeeDetails('u1')).rejects.toEqual({ success: false });
    });

    it('rejects with success false when the lookup throws', async () => {
        findOneMock.mockReturnValue(buildChain(undefined, new Error('DB down')));

        await expect(getEmployeeDetailsService.getEmployeeDetails('u1')).rejects.toEqual({ success: false });
    });
});