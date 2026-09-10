import updateEmployeeTimesheetService from '../../../services/common/updateEmployeeTimesheetService';
import EmployeePackageModel from '../../../model/employeePackageModel';

jest.mock('../../../model/employeePackageModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn(), updateOne: jest.fn() }
}));

const findOneMock = (EmployeePackageModel as unknown as { findOne: jest.Mock }).findOne;
const updateOneMock = (EmployeePackageModel as unknown as { updateOne: jest.Mock }).updateOne;

describe('updateEmployeeTimesheetService', () => {
    beforeEach(() => {
        findOneMock.mockReset();
        updateOneMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const employeePackage = {
        employeeId: 'emp1',
        packages: [
            {
                packageId: 'p1',
                tasks: [
                    {
                        taskId: 't1',
                        timesheet: [
                            {
                                _id: 'ts1',
                                date: new Date('2026-07-08T10:00:00Z'),
                                hours: 5,
                                comments: ''
                            }
                        ]
                    }
                ]
            }
        ]
    };

    const validPayload = {
        employeeId: 'emp1',
        packages: [
            {
                packageId: 'p1',
                tasks: [
                    {
                        taskId: 't1',
                        timesheet: [
                            {
                                date: new Date('2026-07-08T10:00:00Z'),
                                hours: 8,
                                comments: 'updated'
                            }
                        ]
                    }
                ]
            }
        ]
    };

    it('returns not found when the employee package does not exist', async () => {
        findOneMock.mockResolvedValue(null);

        const result = await updateEmployeeTimesheetService.updateEmployeeTimesheet(validPayload);

        expect(findOneMock).toHaveBeenCalledWith({ employeeId: 'emp1' });
        expect(updateOneMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, message: 'Employee timesheet not found' });
    });

    it('updates matched timesheet fields and returns the update result', async () => {
        findOneMock.mockResolvedValue(employeePackage);
        const updateResult = { nModified: 1 };
        updateOneMock.mockResolvedValue(updateResult);

        const result = await updateEmployeeTimesheetService.updateEmployeeTimesheet(validPayload);

        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(updateOneMock).toHaveBeenCalledWith(
            { employeeId: 'emp1' },
            {
                $set: {
                    'packages.0.tasks.0.timesheet.0.hours': 8,
                    'packages.0.tasks.0.timesheet.0.comments': 'updated'
                }
            }
        );
        expect(result).toEqual({ success: true, responseAfterUpdateTimesheet: updateResult });
    });

    it('returns no valid updates when the package does not match', async () => {
        findOneMock.mockResolvedValue(employeePackage);

        const result = await updateEmployeeTimesheetService.updateEmployeeTimesheet({
            employeeId: 'emp1',
            packages: [{ packageId: 'p9', tasks: validPayload.packages[0].tasks }]
        });

        expect(updateOneMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, message: 'No valid updates found in payload' });
    });

    it('returns no valid updates when the timesheet date does not match', async () => {
        findOneMock.mockResolvedValue(employeePackage);

        const result = await updateEmployeeTimesheetService.updateEmployeeTimesheet({
            employeeId: 'emp1',
            packages: [
                {
                    packageId: 'p1',
                    tasks: [
                        {
                            taskId: 't1',
timesheet: [
                            {
                                date: new Date('2026-09-01T10:00:00Z'),
                                hours: 8
                            }
                        ]
                        }
                    ]
                }
            ]
        });

        expect(updateOneMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, message: 'No valid updates found in payload' });
    });

    it('returns no valid updates when the task does not match a package task', async () => {
        findOneMock.mockResolvedValue(employeePackage);

        const result = await updateEmployeeTimesheetService.updateEmployeeTimesheet({
            employeeId: 'emp1',
            packages: [
                {
                    packageId: 'p1',
                    tasks: [
                        {
                            taskId: 't9',
                            timesheet: [
                                { date: new Date('2026-07-08T10:00:00Z'), hours: 8 }
                            ]
                        }
                    ]
                }
            ]
        });

        expect(updateOneMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, message: 'No valid updates found in payload' });
    });

    it('returns the error when the lookup throws', async () => {
        const lookupError = new Error('DB down');
        findOneMock.mockRejectedValue(lookupError);

        const result = await updateEmployeeTimesheetService.updateEmployeeTimesheet(validPayload);

        expect(result).toEqual({
            success: false,
            responseAfterUpdateTimesheet: lookupError,
            message: 'DB down'
        });
    });
});