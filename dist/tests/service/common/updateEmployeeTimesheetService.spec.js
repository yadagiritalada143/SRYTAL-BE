"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateEmployeeTimesheetService_1 = __importDefault(require("../../../services/common/updateEmployeeTimesheetService"));
const employeePackageModel_1 = __importDefault(require("../../../model/employeePackageModel"));
const userModel_1 = __importDefault(require("../../../model/userModel"));
const sendLeaveRequestEmail_1 = __importDefault(require("../../../util/sendLeaveRequestEmail"));
jest.mock('../../../model/employeePackageModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn(), updateOne: jest.fn() }
}));
jest.mock('../../../model/userModel', () => ({
    __esModule: true,
    default: { findById: jest.fn(), find: jest.fn() }
}));
jest.mock('../../../util/sendLeaveRequestEmail', () => ({
    __esModule: true,
    default: {
        sendLeaveRequestToAdmin: jest.fn(),
        sendLeaveApprovalEmail: jest.fn(),
        sendLeaveRejectionEmail: jest.fn()
    }
}));
const findOneMock = employeePackageModel_1.default.findOne;
const updateOneMock = employeePackageModel_1.default.updateOne;
const userFindByIdMock = userModel_1.default.findById;
const userFindMock = userModel_1.default.find;
const sendLeaveRequestToAdminMock = sendLeaveRequestEmail_1.default.sendLeaveRequestToAdmin;
const sendLeaveApprovalEmailMock = sendLeaveRequestEmail_1.default.sendLeaveApprovalEmail;
const sendLeaveRejectionEmailMock = sendLeaveRequestEmail_1.default.sendLeaveRejectionEmail;
const leanishUserQuery = (user) => ({ lean: jest.fn().mockResolvedValue(user) });
const leanishAdminQuery = (admins) => ({
    select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(admins) })
});
describe('updateEmployeeTimesheetService', () => {
    beforeEach(() => {
        findOneMock.mockReset();
        updateOneMock.mockReset();
        userFindByIdMock.mockReset();
        userFindMock.mockReset();
        sendLeaveRequestToAdminMock.mockReset();
        sendLeaveApprovalEmailMock.mockReset();
        sendLeaveRejectionEmailMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'log').mockImplementation(() => { });
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
        const result = await updateEmployeeTimesheetService_1.default.updateEmployeeTimesheet(validPayload);
        expect(findOneMock).toHaveBeenCalledWith({ employeeId: 'emp1' });
        expect(updateOneMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, message: 'Employee timesheet not found' });
    });
    it('updates matched timesheet fields and returns the update result', async () => {
        findOneMock.mockResolvedValue(employeePackage);
        const updateResult = { nModified: 1 };
        updateOneMock.mockResolvedValue(updateResult);
        const result = await updateEmployeeTimesheetService_1.default.updateEmployeeTimesheet(validPayload);
        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(updateOneMock).toHaveBeenCalledWith({ employeeId: 'emp1' }, {
            $set: {
                'packages.0.tasks.0.timesheet.0.hours': 8,
                'packages.0.tasks.0.timesheet.0.comments': 'updated'
            }
        });
        expect(result).toEqual({ success: true, responseAfterUpdateTimesheet: updateResult });
    });
    it('returns no valid updates when the package does not match', async () => {
        findOneMock.mockResolvedValue(employeePackage);
        const result = await updateEmployeeTimesheetService_1.default.updateEmployeeTimesheet({
            employeeId: 'emp1',
            packages: [{ packageId: 'p9', tasks: validPayload.packages[0].tasks }]
        });
        expect(updateOneMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, message: 'No valid updates found in payload' });
    });
    it('returns no valid updates when the timesheet date does not match', async () => {
        findOneMock.mockResolvedValue(employeePackage);
        const result = await updateEmployeeTimesheetService_1.default.updateEmployeeTimesheet({
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
        const result = await updateEmployeeTimesheetService_1.default.updateEmployeeTimesheet({
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
        const result = await updateEmployeeTimesheetService_1.default.updateEmployeeTimesheet(validPayload);
        expect(result).toEqual({
            success: false,
            responseAfterUpdateTimesheet: lookupError,
            message: 'DB down'
        });
    });
    it('sends a leave request email to admins when an employee applies for leave', async () => {
        findOneMock.mockResolvedValue(Object.assign(Object.assign({}, employeePackage), { packages: [{
                    packageId: 'p1',
                    tasks: [{
                            taskId: 't1',
                            timesheet: [{
                                    _id: 'ts1',
                                    date: new Date('2026-07-08T10:00:00Z'),
                                    hours: 0,
                                    isVacation: false,
                                    status: 'Not Submitted',
                                    leaveReason: ''
                                }]
                        }]
                }] }));
        updateOneMock.mockResolvedValue({ nModified: 1 });
        userFindByIdMock.mockReturnValue(leanishUserQuery({ _id: 'emp1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' }));
        userFindMock.mockReturnValue(leanishAdminQuery([{ email: 'admin@example.com' }]));
        const result = await updateEmployeeTimesheetService_1.default.updateEmployeeTimesheet({
            employeeId: 'emp1',
            packages: [{
                    packageId: 'p1',
                    tasks: [{
                            taskId: 't1',
                            timesheet: [{
                                    date: new Date('2026-07-08T10:00:00Z'),
                                    isVacation: true,
                                    leaveType: 'Casual Leave',
                                    startDate: new Date('2026-07-08T10:00:00Z'),
                                    endDate: new Date('2026-07-11T10:00:00Z'),
                                    leaveReason: 'Family function',
                                    status: 'Waiting For Approval'
                                }]
                        }]
                }]
        });
        expect(sendLeaveRequestToAdminMock).toHaveBeenCalledTimes(1);
        expect(sendLeaveRequestToAdminMock).toHaveBeenCalledWith(expect.objectContaining({
            employeeName: 'John Doe',
            employeeEmail: 'john@example.com',
            leaveReason: 'Family function',
            date: new Date('2026-07-08T10:00:00Z'),
            status: 'Pending',
            leaveType: 'Casual Leave',
            startDate: new Date('2026-07-08T10:00:00Z'),
            endDate: new Date('2026-07-11T10:00:00Z'),
            adminEmails: ['admin@example.com']
        }));
        expect(sendLeaveApprovalEmailMock).not.toHaveBeenCalled();
        expect(sendLeaveRejectionEmailMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: true, responseAfterUpdateTimesheet: { nModified: 1 } });
    });
    it('does not send a duplicate leave request email when the same waiting state is resubmitted', async () => {
        findOneMock.mockResolvedValue(Object.assign(Object.assign({}, employeePackage), { packages: [{
                    packageId: 'p1',
                    tasks: [{
                            taskId: 't1',
                            timesheet: [{
                                    _id: 'ts1',
                                    date: new Date('2026-07-08T10:00:00Z'),
                                    hours: 0,
                                    isVacation: true,
                                    status: 'Waiting For Approval',
                                    leaveReason: 'Sick'
                                }]
                        }]
                }] }));
        updateOneMock.mockResolvedValue({ nModified: 1 });
        await updateEmployeeTimesheetService_1.default.updateEmployeeTimesheet({
            employeeId: 'emp1',
            packages: [{
                    packageId: 'p1',
                    tasks: [{
                            taskId: 't1',
                            timesheet: [{
                                    date: new Date('2026-07-08T10:00:00Z'),
                                    isVacation: true,
                                    leaveReason: 'Sick',
                                    status: 'Waiting For Approval'
                                }]
                        }]
                }]
        });
        expect(sendLeaveRequestToAdminMock).not.toHaveBeenCalled();
        expect(sendLeaveApprovalEmailMock).not.toHaveBeenCalled();
        expect(sendLeaveRejectionEmailMock).not.toHaveBeenCalled();
    });
    it('sends an approval email to the employee when an admin approves a pending leave request', async () => {
        findOneMock.mockResolvedValue(Object.assign(Object.assign({}, employeePackage), { packages: [{
                    packageId: 'p1',
                    tasks: [{
                            taskId: 't1',
                            timesheet: [{
                                    _id: 'ts1',
                                    date: new Date('2026-07-08T10:00:00Z'),
                                    hours: 0,
                                    isVacation: true,
                                    status: 'Waiting For Approval',
                                    leaveReason: 'Sick'
                                }]
                        }]
                }] }));
        updateOneMock.mockResolvedValue({ nModified: 1 });
        userFindByIdMock.mockReturnValue(leanishUserQuery({ _id: 'emp1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' }));
        await updateEmployeeTimesheetService_1.default.updateEmployeeTimesheet({
            employeeId: 'emp1',
            packages: [{
                    packageId: 'p1',
                    tasks: [{
                            taskId: 't1',
                            timesheet: [{
                                    date: new Date('2026-07-08T10:00:00Z'),
                                    isVacation: true,
                                    status: 'Approved'
                                }]
                        }]
                }]
        });
        expect(sendLeaveApprovalEmailMock).toHaveBeenCalledTimes(1);
        expect(sendLeaveApprovalEmailMock).toHaveBeenCalledWith(expect.objectContaining({
            employeeName: 'John Doe',
            employeeEmail: 'john@example.com',
            leaveReason: 'Sick',
            status: 'Approved',
            date: new Date('2026-07-08T10:00:00Z')
        }));
        expect(sendLeaveRequestToAdminMock).not.toHaveBeenCalled();
        expect(sendLeaveRejectionEmailMock).not.toHaveBeenCalled();
    });
    it('sends a rejection email with the rejection reason to the employee', async () => {
        findOneMock.mockResolvedValue(Object.assign(Object.assign({}, employeePackage), { packages: [{
                    packageId: 'p1',
                    tasks: [{
                            taskId: 't1',
                            timesheet: [{
                                    _id: 'ts1',
                                    date: new Date('2026-07-08T10:00:00Z'),
                                    hours: 0,
                                    isVacation: true,
                                    status: 'Waiting For Approval',
                                    leaveReason: 'Sick'
                                }]
                        }]
                }] }));
        updateOneMock.mockResolvedValue({ nModified: 1 });
        userFindByIdMock.mockReturnValue(leanishUserQuery({ _id: 'emp1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' }));
        await updateEmployeeTimesheetService_1.default.updateEmployeeTimesheet({
            employeeId: 'emp1',
            packages: [{
                    packageId: 'p1',
                    tasks: [{
                            taskId: 't1',
                            timesheet: [{
                                    date: new Date('2026-07-08T10:00:00Z'),
                                    status: 'Rejected',
                                    rejectionReason: 'Need more staff on that day'
                                }]
                        }]
                }]
        });
        expect(sendLeaveRejectionEmailMock).toHaveBeenCalledTimes(1);
        expect(sendLeaveRejectionEmailMock).toHaveBeenCalledWith(expect.objectContaining({
            employeeName: 'John Doe',
            employeeEmail: 'john@example.com',
            leaveReason: 'Sick',
            status: 'Rejected',
            rejectionReason: 'Need more staff on that day',
            date: new Date('2026-07-08T10:00:00Z')
        }));
        expect(sendLeaveRequestToAdminMock).not.toHaveBeenCalled();
        expect(sendLeaveApprovalEmailMock).not.toHaveBeenCalled();
    });
    it('sends no emails when the timesheet update fails', async () => {
        findOneMock.mockResolvedValue(Object.assign(Object.assign({}, employeePackage), { packages: [{
                    packageId: 'p1',
                    tasks: [{
                            taskId: 't1',
                            timesheet: [{
                                    _id: 'ts1',
                                    date: new Date('2026-07-08T10:00:00Z'),
                                    isVacation: false,
                                    status: 'Not Submitted'
                                }]
                        }]
                }] }));
        const updateError = new Error('Update failed');
        updateOneMock.mockRejectedValue(updateError);
        const result = await updateEmployeeTimesheetService_1.default.updateEmployeeTimesheet({
            employeeId: 'emp1',
            packages: [{
                    packageId: 'p1',
                    tasks: [{
                            taskId: 't1',
                            timesheet: [{
                                    date: new Date('2026-07-08T10:00:00Z'),
                                    isVacation: true,
                                    leaveReason: 'Sick',
                                    status: 'Waiting For Approval'
                                }]
                        }]
                }]
        });
        expect(result).toEqual({
            success: false,
            responseAfterUpdateTimesheet: updateError,
            message: 'Update failed'
        });
        expect(sendLeaveRequestToAdminMock).not.toHaveBeenCalled();
        expect(sendLeaveApprovalEmailMock).not.toHaveBeenCalled();
        expect(sendLeaveRejectionEmailMock).not.toHaveBeenCalled();
    });
    it('keeps the successful update result even when the email dispatch throws', async () => {
        findOneMock.mockResolvedValue(Object.assign(Object.assign({}, employeePackage), { packages: [{
                    packageId: 'p1',
                    tasks: [{
                            taskId: 't1',
                            timesheet: [{
                                    _id: 'ts1',
                                    date: new Date('2026-07-08T10:00:00Z'),
                                    isVacation: false,
                                    status: 'Not Submitted'
                                }]
                        }]
                }] }));
        updateOneMock.mockResolvedValue({ nModified: 1 });
        userFindByIdMock.mockReturnValue(leanishUserQuery({ _id: 'emp1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' }));
        userFindMock.mockReturnValue(leanishAdminQuery([{ email: 'admin@example.com' }]));
        sendLeaveRequestToAdminMock.mockRejectedValue(new Error('SMTP down'));
        const result = await updateEmployeeTimesheetService_1.default.updateEmployeeTimesheet({
            employeeId: 'emp1',
            packages: [{
                    packageId: 'p1',
                    tasks: [{
                            taskId: 't1',
                            timesheet: [{
                                    date: new Date('2026-07-08T10:00:00Z'),
                                    isVacation: true,
                                    leaveReason: 'Sick',
                                    status: 'Waiting For Approval'
                                }]
                        }]
                }]
        });
        expect(sendLeaveRequestToAdminMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: true, responseAfterUpdateTimesheet: { nModified: 1 } });
    });
    it('sends only one email per leave day even when the day appears across multiple tasks', async () => {
        findOneMock.mockResolvedValue({
            employeeId: 'emp1',
            packages: [{
                    packageId: 'p1',
                    tasks: [
                        {
                            taskId: 't1',
                            timesheet: [{
                                    _id: 'ts1',
                                    date: new Date('2026-07-08T10:00:00Z'),
                                    isVacation: false,
                                    status: 'Not Submitted'
                                }]
                        },
                        {
                            taskId: 't2',
                            timesheet: [{
                                    _id: 'ts2',
                                    date: new Date('2026-07-08T10:00:00Z'),
                                    isVacation: false,
                                    status: 'Not Submitted'
                                }]
                        }
                    ]
                }]
        });
        updateOneMock.mockResolvedValue({ nModified: 2 });
        userFindByIdMock.mockReturnValue(leanishUserQuery({ _id: 'emp1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' }));
        userFindMock.mockReturnValue(leanishAdminQuery([{ email: 'admin@example.com' }]));
        await updateEmployeeTimesheetService_1.default.updateEmployeeTimesheet({
            employeeId: 'emp1',
            packages: [{
                    packageId: 'p1',
                    tasks: [
                        {
                            taskId: 't1',
                            timesheet: [{
                                    date: new Date('2026-07-08T10:00:00Z'),
                                    isVacation: true,
                                    leaveReason: 'Sick',
                                    status: 'Waiting For Approval'
                                }]
                        },
                        {
                            taskId: 't2',
                            timesheet: [{
                                    date: new Date('2026-07-08T10:00:00Z'),
                                    isVacation: true,
                                    leaveReason: 'Sick',
                                    status: 'Waiting For Approval'
                                }]
                        }
                    ]
                }]
        });
        expect(sendLeaveRequestToAdminMock).toHaveBeenCalledTimes(1);
    });
});
