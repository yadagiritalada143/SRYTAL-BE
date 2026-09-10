import getDashboardStatsByAdminService from '../../../services/admin/getDashboardStatsByAdminService';
import UserModel from '../../../model/userModel';
import EmployeePackageModel from '../../../model/employeePackageModel';

jest.mock('../../../model/userModel', () => {
    const UserModel = jest.fn();
    (UserModel as any).find = jest.fn();
    return { __esModule: true, default: UserModel };
});

jest.mock('../../../model/employeePackageModel', () => {
    const EmployeePackageModel = jest.fn();
    (EmployeePackageModel as any).find = jest.fn();
    return { __esModule: true, default: EmployeePackageModel };
});

const UserModelMock = UserModel as unknown as jest.Mock & { find: jest.Mock };
const EmployeePackageModelMock = EmployeePackageModel as unknown as jest.Mock & { find: jest.Mock };

const buildFindLeanChain = (mock: jest.Mock, value: any[]) => {
    const chain: any = {
        populate: jest.fn(function () { return this; }),
        lean: jest.fn(() => value),
    };
    mock.mockReturnValue(chain);
    return chain;
};

describe('getDashboardStatsByAdminService', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-07-10T00:00:00Z'));
        UserModelMock.mockReset();
        UserModelMock.find = jest.fn();
        EmployeePackageModelMock.mockReset();
        EmployeePackageModelMock.find = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('aggregates employee, timesheet, birthday and anniversary statistics', async () => {
        const employees = [
            {
                _id: 'u1',
                userRole: 'Admin',
                department: { departmentName: 'IT' },
                employmentType: { employmentType: 'Full-time' },
                passwordResetRequired: 'true',
                firstName: 'John',
                lastName: 'Doe',
                employeeId: 'EMP-1',
                dateOfBirth: new Date('1990-07-15T00:00:00Z'),
                dateOfJoining: new Date('2024-07-20T00:00:00Z'),
            },
            {
                _id: 'u2',
                userRole: 'Employee',
                department: { departmentName: 'HR' },
                employmentType: { employmentType: 'Contract' },
                passwordResetRequired: 'false',
                firstName: 'Jane',
                lastName: '',
                employeeId: 'EMP-2',
                dateOfBirth: new Date('1995-06-05T00:00:00Z'),
                dateOfJoining: new Date('2025-06-05T00:00:00Z'),
            },
            {
                _id: 'u3',
                userRole: 'Employee',
                department: null,
                employmentType: null,
                firstName: 'Bob',
                lastName: '',
                employeeId: 'EMP-3',
                employeeRole: [{ designation: 'SDE' }, { designation: 'Lead' }],
                dateOfBirth: 'not-a-date',
                dateOfJoining: '2026-07-20T00:00:00Z',
            },
        ];
        const employeePackages = [
            {
                employeeId: 'u1',
                packages: [
                    { packageId: { _id: 'p1' }, tasks: [] },
                    { packageId: {}, tasks: [] },
                ],
            },
            {
                employeeId: 'u2',
                packages: [
                    {
                        packageId: { _id: 'p2' },
                        tasks: [
                            {
                                timesheet: [
                                    { status: 'Waiting For Approval', date: '2026-07-05T00:00:00Z', hours: 5.5 },
                                    { status: 'Approved', date: '2026-07-06T00:00:00Z', hours: 4 },
                                    { status: 'Rejected', date: '2026-06-05T00:00:00Z', hours: 9 },
                                    { status: 'Approved', date: 'not-a-date', hours: 3 },
                                    { status: 'Waiting For Approval', hours: '7' },
                                ],
                            },
                        ],
                    },
                ],
            },
            { employeeId: 'u3', packages: [] },
        ];

        const userChain = buildFindLeanChain(UserModelMock.find, employees);
        const packageChain = buildFindLeanChain(EmployeePackageModelMock.find, employeePackages);

        const result = await getDashboardStatsByAdminService.getDashboardStatsByAdmin('org1', 'adminId');

        expect(UserModelMock.find).toHaveBeenCalledWith({
            organization: 'org1',
            isDeleted: { $ne: true },
        });
        expect(userChain.populate).toHaveBeenCalledTimes(3);
        expect(EmployeePackageModelMock.find).toHaveBeenCalledWith({
            employeeId: { $in: ['u1', 'u2', 'u3'] },
        });
        expect(packageChain.populate).toHaveBeenCalledTimes(1);

        expect(result.success).toBe(true);
        expect(result.stats).toEqual({
            totalEmployees: 3,
            activeProjects: 2,
            pendingTimesheetApprovals: 2,
            pendingPasswordResets: 1,
            hoursLoggedThisMonth: 9.5,
            employeesLoggingThisMonth: 1,
        });
        expect(result.roleBreakdown).toEqual({ Admin: 1, Employee: 2 });
        expect(result.departmentBreakdown).toEqual({ IT: 1, HR: 1, Unassigned: 1 });
        expect(result.employmentTypeBreakdown).toEqual({ 'Full-time': 1, Contract: 1, Unspecified: 1 });
        expect(result.upcomingBirthdays).toEqual([{ name: 'John Doe', date: 15, employeeId: 'EMP-1' }]);
        expect(result.workAnniversaries).toEqual([
            { name: 'John Doe', date: 20, years: 1, employeeId: 'EMP-1' },
        ]);

        expect(result.recentHires.map((h: any) => h.employeeId)).toEqual(['EMP-3', 'EMP-2', 'EMP-1']);
        expect(result.recentHires[0]).toMatchObject({
            name: 'Bob',
            userRole: 'Employee',
            department: null,
            designation: 'SDE, Lead',
        });
        expect(result.recentHires[1]).toMatchObject({ name: 'Jane', designation: null });
        expect(result.recentHires[2]).toMatchObject({ name: 'John Doe' });
    });

    it('handles an empty organization and packages without tasks or timesheets', async () => {
        buildFindLeanChain(UserModelMock.find, []);
        const employeePackages = [
            {
                employeeId: 'x1',
                packages: [
                    { packageId: { _id: 'p9' } },
                    { packageId: { _id: 'p8' }, tasks: [{ timesheet: undefined }] },
                ],
            },
        ];
        buildFindLeanChain(EmployeePackageModelMock.find, employeePackages);

        const result = await getDashboardStatsByAdminService.getDashboardStatsByAdmin('org1', 'adminId');

        expect(result.success).toBe(true);
        expect(result.stats).toEqual({
            totalEmployees: 0,
            activeProjects: 2,
            pendingTimesheetApprovals: 0,
            pendingPasswordResets: 0,
            hoursLoggedThisMonth: 0,
            employeesLoggingThisMonth: 0,
        });
        expect(result.recentHires).toEqual([]);
        expect(result.upcomingBirthdays).toEqual([]);
        expect(result.workAnniversaries).toEqual([]);
    });
});