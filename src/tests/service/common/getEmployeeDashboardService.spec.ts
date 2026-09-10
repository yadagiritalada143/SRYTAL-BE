import getEmployeeDashboardService from '../../../services/common/getEmployeeDashboardService';
import EmployeePackageModel from '../../../model/employeePackageModel';
import UserModel from '../../../model/userModel';

jest.mock('../../../model/employeePackageModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

jest.mock('../../../model/userModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

const packageFindMock = (EmployeePackageModel as unknown as { find: jest.Mock }).find;
const userFindByIdMock = (UserModel as unknown as { findById: jest.Mock }).findById;

describe('getEmployeeDashboardService', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 6, 10, 12, 0, 0));
        packageFindMock.mockReset();
        userFindByIdMock.mockReset();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    const mockPackageChain = (documents: any) => {
        packageFindMock.mockReturnValue({
            populate: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(documents)
                })
            })
        });
    };

    const mockUserChain = (employee: any) => {
        userFindByIdMock.mockReturnValue({
            populate: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        lean: jest.fn().mockResolvedValue(employee)
                    })
                })
            })
        });
    };

    it('returns the full dashboard aggregation for the employee', async () => {
        const employee = {
            firstName: 'John',
            lastName: 'Doe',
            employeeId: 'EMP-1',
            employeeRole: [{ designation: 'Software Engineer' }],
            department: { departmentName: 'Engineering' },
            employmentType: { employmentType: 'Full Time' },
            dateOfJoining: new Date(2024, 6, 20, 9, 0, 0)
        };
        mockUserChain(employee);

        const packageDocuments = [
            {
                _id: 'ep1',
                packages: [
                    {
                        packageId: { _id: 'proj1', title: 'Project Alpha', endDate: new Date(2026, 11, 31) },
                        tasks: [
                            {
                                taskId: { _id: 'task1', title: 'Build API' },
                                timesheet: [
                                    {
                                        date: new Date(2026, 6, 5, 22, 0),
                                        hours: 4,
                                        status: 'Waiting For Approval',
                                        comments: 'c1'
                                    },
                                    {
                                        date: new Date(2026, 6, 6, 8, 0),
                                        hours: 0,
                                        status: 'Approved'
                                    },
                                    {
                                        date: new Date(2026, 6, 8, 10, 0),
                                        hours: 6,
                                        status: 'Approved',
                                        comments: 'c2'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        packageId: { _id: 'proj2', title: 'Project Beta' },
                        tasks: [
                            {
                                taskId: { _id: 'task2', title: 'Write Docs' },
                                timesheet: [
                                    {
                                        date: new Date(2026, 6, 20, 9, 0),
                                        hours: 2,
                                        status: 'Rejected'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                _id: 'ep2',
                packages: [
                    {
                        packageId: null,
                        tasks: [
                            {
                                taskId: { _id: 'task3', title: '' },
                                timesheet: [
                                    {
                                        date: new Date(2025, 0, 1, 0, 0),
                                        hours: 3,
                                        status: 'Not Submitted'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ];
        mockPackageChain(packageDocuments);

        const result = await getEmployeeDashboardService.getEmployeeDashboard('u1');

        expect(userFindByIdMock).toHaveBeenCalledWith('u1');
        expect(packageFindMock).toHaveBeenCalledWith({ employeeId: 'u1' });
        expect(result.success).toBe(true);
        expect(result.profile).toEqual({
            firstName: 'John',
            lastName: 'Doe',
            employeeId: 'EMP-1',
            designation: 'Software Engineer',
            department: 'Engineering',
            employmentType: 'Full Time',
            dateOfJoining: new Date(2024, 6, 20, 9, 0, 0),
            tenure: '1 yr 11 mos'
        });
        expect(result.stats).toEqual({
            hoursThisMonth: 12,
            hoursThisWeek: 8,
            daysLoggedThisMonth: 3,
            activeProjects: 3,
            tasksAssigned: 3,
            pendingApprovals: 1
        });
        expect(result.statusCounts).toEqual({
            approved: 2,
            waiting: 1,
            rejected: 1,
            notSubmitted: 1
        });
        expect(result.projects[0]).toEqual({ title: 'Project Alpha', hours: 10, endDate: new Date(2026, 11, 31) });
        expect(result.recentEntries[0]).toMatchObject({ hours: 2, status: 'Rejected', taskTitle: 'Write Docs', projectTitle: 'Project Beta' });
        expect(result.recentEntries[1]).toMatchObject({ hours: 6, status: 'Approved', taskTitle: 'Build API', projectTitle: 'Project Alpha' });
        expect(result.recentEntries[2]).toMatchObject({ hours: 4, status: 'Waiting For Approval', taskTitle: 'Build API', projectTitle: 'Project Alpha' });
        expect(result.recentEntries[3]).toMatchObject({ hours: 3, status: 'Not Submitted' });
    });

    it('returns empty profile and zeroed stats when the employee has no data', async () => {
        mockUserChain(null);
        mockPackageChain(null);

        const result = await getEmployeeDashboardService.getEmployeeDashboard('u1');

        expect(result.success).toBe(true);
        expect(result.profile).toEqual({
            firstName: '',
            lastName: '',
            employeeId: null,
            designation: null,
            department: null,
            employmentType: null,
            dateOfJoining: null,
            tenure: null
        });
        expect(result.stats).toEqual({
            hoursThisMonth: 0,
            hoursThisWeek: 0,
            daysLoggedThisMonth: 0,
            activeProjects: 0,
            tasksAssigned: 0,
            pendingApprovals: 0
        });
        expect(result.statusCounts).toEqual({ approved: 0, waiting: 0, rejected: 0, notSubmitted: 0 });
        expect(result.projects).toEqual([]);
        expect(result.recentEntries).toEqual([]);
    });

    it('handles a Sunday week start and falsy package structures', async () => {
        jest.setSystemTime(new Date(2026, 6, 12, 10, 0, 0));
        mockUserChain({ firstName: 'NoRole', employeeRole: [] });

        const packageDocuments = [
            { _id: 'ep0', packages: null },
            {
                _id: 'ep1',
                packages: [{ packageId: { _id: 'p1', title: 'One' }, tasks: null }]
            },
            {
                _id: 'ep2',
                packages: [
                    {
                        packageId: { _id: 'p2', title: 'Two' },
                        tasks: [
                            { taskId: null, timesheet: null },
                            {
                                taskId: { _id: 't1', title: '' },
                                timesheet: [
                                    { date: null, hours: 5 },
                                    { date: new Date(2026, 6, 7, 9, 0, 0), hours: 7 }
                                ]
                            }
                        ]
                    }
                ]
            }
        ];
        mockPackageChain(packageDocuments);

        const result = await getEmployeeDashboardService.getEmployeeDashboard('u1');

        expect(result.success).toBe(true);
        expect(result.profile.firstName).toBe('NoRole');
        expect(result.profile.designation).toBeNull();
        expect(result.stats).toEqual({
            hoursThisMonth: 7,
            hoursThisWeek: 7,
            daysLoggedThisMonth: 1,
            activeProjects: 2,
            tasksAssigned: 1,
            pendingApprovals: 0
        });
        expect(result.projects[0]).toEqual({ title: 'Two', hours: 7, endDate: undefined });
        expect(result.recentEntries).toHaveLength(1);
        expect(result.recentEntries[0]).toMatchObject({ hours: 7, status: 'Not Submitted', taskTitle: 'Untitled Task' });
    });

    it('returns null tenure for an invalid joining date', async () => {
        mockUserChain({ firstName: 'A', dateOfJoining: new Date('not-a-date') });
        mockPackageChain([]);

        const result = await getEmployeeDashboardService.getEmployeeDashboard('u1');

        expect(result.profile.tenure).toBeNull();
    });

    it('formats tenure with plural years', async () => {
        mockUserChain({ firstName: 'A', dateOfJoining: new Date(2021, 6, 1) });
        mockPackageChain([]);

        const result = await getEmployeeDashboardService.getEmployeeDashboard('u1');

        expect(result.profile.tenure).toBe('5 yrs 0 mos');
    });

    it('formats tenure with a single month', async () => {
        mockUserChain({ firstName: 'A', dateOfJoining: new Date(2026, 5, 10) });
        mockPackageChain([]);

        const result = await getEmployeeDashboardService.getEmployeeDashboard('u1');

        expect(result.profile.tenure).toBe('1 mo');
    });

    it('joins only roles that have a designation', async () => {
        mockUserChain({ firstName: 'A', employeeRole: [{ designation: '' }, { designation: 'Lead' }] });
        mockPackageChain([]);

        const result = await getEmployeeDashboardService.getEmployeeDashboard('u1');

        expect(result.profile.designation).toBe('Lead');
    });
});