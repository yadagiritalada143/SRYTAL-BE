import EmployeePackageModel from "../../model/employeePackageModel";
import UserModel from "../../model/userModel";
import sendLeaveRequestEmail from "../../util/sendLeaveRequestEmail";
import {
    IPackage,
    ITask,
    ITimesheet,
    UpdateEmployeeTimesheetResponse,
    TimesheetUpdate,
    TaskUpdate,
    PackageUpdate,
    UpdateTimesheetPayload
} from '../../interfaces/employeepackages';

const LEAVE_REQUEST_STATUS = {
    APPROVED: 'Approved',
    WAITING: 'Waiting For Approval',
    REJECTED: 'Rejected'
};

const LEAVE_EMAIL_TYPE = {
    REQUEST: 'request',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};

interface LeaveEmailNotification {
    type: string;
    date: Date;
    leaveReason: string;
    status: string;
    rejectionReason?: string;
    leaveType?: string;
    startDate?: Date | string;
    endDate?: Date | string;
}

const updateEmployeeTimesheet = async (updateEmployeeTimesheetPayload: UpdateTimesheetPayload): Promise<UpdateEmployeeTimesheetResponse> => {
    try {
        const { employeeId, packages } = updateEmployeeTimesheetPayload;

        const employeePackage = await EmployeePackageModel.findOne({
            employeeId: employeeId
        });

        if (!employeePackage) {
            return {
                success: false,
                message: "Employee timesheet not found"
            };
        }

        const updateOperations: Record<string, any> = {};
        const leaveNotifications: LeaveEmailNotification[] = [];
        const leaveNotificationKeys = new Set<string>();
        let hasUpdates = false;

        packages.forEach((payloadPackage: PackageUpdate) => {
            const packageIndex = employeePackage.packages.findIndex(
                (dbPackage: IPackage) => dbPackage.packageId.toString() === payloadPackage.packageId.toString()
            );

            if (packageIndex === -1) return;

            payloadPackage.tasks.forEach((payloadTask: TaskUpdate) => {
                const taskIndex = employeePackage.packages[packageIndex].tasks.findIndex(
                    (dbTask: ITask) => dbTask.taskId.toString() === payloadTask.taskId.toString()
                );

                if (taskIndex === -1) return;

                payloadTask.timesheet.forEach((payloadTimesheet: TimesheetUpdate) => {
                    const timesheetIndex = employeePackage.packages[packageIndex].tasks[taskIndex].timesheet.findIndex(
                        (dbTimesheet: ITimesheet) => areDatesEqual(dbTimesheet.date, payloadTimesheet.date)
                    );

                    if (timesheetIndex === -1) return;

                    const dbTimesheet = employeePackage.packages[packageIndex].tasks[taskIndex].timesheet[timesheetIndex];

                    const leaveNotification = detectLeaveNotification(dbTimesheet, payloadTimesheet);
                    if (leaveNotification) {
                        const leaveKey = `${leaveNotification.type}|${toDateKey(leaveNotification.date)}`;
                        if (!leaveNotificationKeys.has(leaveKey)) {
                            leaveNotificationKeys.add(leaveKey);
                            leaveNotifications.push(leaveNotification);
                        }
                    }

                    const basePath = `packages.${packageIndex}.tasks.${taskIndex}.timesheet.${timesheetIndex}`;

                    Object.entries(payloadTimesheet)
                        .filter(([key]) => key !== '_id' && key !== 'date')
                        .forEach(([key, value]) => {
                            updateOperations[`${basePath}.${key}`] = value;
                            hasUpdates = true;
                        });
                });
            });
        });

        if (hasUpdates) {
            const result = await EmployeePackageModel.updateOne(
                { employeeId: employeeId },
                { $set: updateOperations }
            );

            if (leaveNotifications.length > 0) {
                try {
                    await dispatchLeaveEmailNotifications(String(employeeId), leaveNotifications);
                } catch (error: any) {
                    console.error(`Error while dispatching leave email notifications: ${error}`);
                }
            }

            return {
                success: true,
                responseAfterUpdateTimesheet: result
            };
        } else {
            return {
                success: false,
                message: "No valid updates found in payload"
            };
        }
    } catch (error: any) {
        console.error(`Error in updating employee timesheet: ${error}`);
        return {
            success: false,
            responseAfterUpdateTimesheet: error,
            message: error.message
        };
    }
};

const areDatesEqual = (date1: Date, date2: Date) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const returnVal = (
        d1.getUTCFullYear() === d2.getUTCFullYear() &&
        d1.getUTCMonth() === d2.getUTCMonth() &&
        d1.getUTCDate() === d2.getUTCDate()
    );
    return returnVal;
};

const toDateKey = (date: Date): string => {
    const d = new Date(date);
    return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
};

// Detects a leave status transition on a vacation day and maps it to the email
// action that should follow. Comparing against the value already stored in the
// database prevents duplicate emails when the same payload is submitted again.
const detectLeaveNotification = (dbTimesheet: ITimesheet, payloadTimesheet: TimesheetUpdate): LeaveEmailNotification | null => {
    const oldStatus = (dbTimesheet && dbTimesheet.status) || '';
    const newStatus = (payloadTimesheet.status || '').trim();
    if (!newStatus) return null;

    const isVacationDay = payloadTimesheet.isVacation === true || (dbTimesheet && dbTimesheet.isVacation === true);

    if (payloadTimesheet.isVacation === true && newStatus === LEAVE_REQUEST_STATUS.WAITING && oldStatus !== LEAVE_REQUEST_STATUS.WAITING) {
        return {
            type: LEAVE_EMAIL_TYPE.REQUEST,
            date: payloadTimesheet.date,
            leaveReason: (payloadTimesheet.leaveReason || (dbTimesheet && dbTimesheet.leaveReason) || '').trim() || 'N/A',
            status: 'Pending',
            leaveType: (payloadTimesheet.leaveType || (dbTimesheet && dbTimesheet.leaveType) || '').trim() || undefined,
            startDate: payloadTimesheet.startDate || (dbTimesheet && dbTimesheet.startDate) || payloadTimesheet.date,
            endDate: payloadTimesheet.endDate || (dbTimesheet && dbTimesheet.endDate) || payloadTimesheet.date
        };
    }

    if (isVacationDay && oldStatus === LEAVE_REQUEST_STATUS.WAITING && newStatus === LEAVE_REQUEST_STATUS.APPROVED) {
        return {
            type: LEAVE_EMAIL_TYPE.APPROVED,
            date: payloadTimesheet.date,
            leaveReason: (payloadTimesheet.leaveReason || (dbTimesheet && dbTimesheet.leaveReason) || '').trim() || 'N/A',
            status: LEAVE_REQUEST_STATUS.APPROVED,
            leaveType: (payloadTimesheet.leaveType || (dbTimesheet && dbTimesheet.leaveType) || '').trim() || undefined,
            startDate: payloadTimesheet.startDate || (dbTimesheet && dbTimesheet.startDate) || payloadTimesheet.date,
            endDate: payloadTimesheet.endDate || (dbTimesheet && dbTimesheet.endDate) || payloadTimesheet.date
        };
    }

    if (isVacationDay && oldStatus === LEAVE_REQUEST_STATUS.WAITING && newStatus === LEAVE_REQUEST_STATUS.REJECTED) {
        return {
            type: LEAVE_EMAIL_TYPE.REJECTED,
            date: payloadTimesheet.date,
            leaveReason: (payloadTimesheet.leaveReason || (dbTimesheet && dbTimesheet.leaveReason) || '').trim() || 'N/A',
            status: LEAVE_REQUEST_STATUS.REJECTED,
            rejectionReason: (payloadTimesheet.rejectionReason || '').trim() || undefined,
            leaveType: (payloadTimesheet.leaveType || (dbTimesheet && dbTimesheet.leaveType) || '').trim() || undefined,
            startDate: payloadTimesheet.startDate || (dbTimesheet && dbTimesheet.startDate) || payloadTimesheet.date,
            endDate: payloadTimesheet.endDate || (dbTimesheet && dbTimesheet.endDate) || payloadTimesheet.date
        };
    }

    return null;
};

const getAdminEmails = async (): Promise<string[]> => {
    const admins: any[] = await UserModel.find({ userRole: 'admin', isDeleted: { $ne: true } }).select('email').lean();
    const emails = admins.map((admin) => admin && admin.email).filter((email) => email);
    if (emails.length > 0) return emails;
    if (process.env.ADMIN_EMAIL_ABOUT_CUSTOMER) return [process.env.ADMIN_EMAIL_ABOUT_CUSTOMER];
    return [];
};

// Sends the leave notification emails after the timesheet update has already
// been persisted. Email failures are logged here and swallowed so they never
// alter the leave application's database status or the API response.
const dispatchLeaveEmailNotifications = async (employeeId: string, notifications: LeaveEmailNotification[]): Promise<void> => {
    const employee: any = await UserModel.findById(employeeId).lean();

    if (!employee) {
        console.error('[LeaveEmail] Employee not found; skipping leave email notifications.');
        return;
    }

    const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Employee';
    const employeeEmail = employee.email;

    if (!employeeEmail) {
        console.error('[LeaveEmail] Employee has no email address; skipping leave email notifications.');
        return;
    }

    for (const notification of notifications) {
        const commonDetails = {
            employeeName,
            employeeEmail,
            leaveReason: notification.leaveReason,
            date: notification.date,
            status: notification.status,
            leaveType: notification.leaveType,
            startDate: notification.startDate,
            endDate: notification.endDate
        };

        if (notification.type === LEAVE_EMAIL_TYPE.REQUEST) {
            const adminEmails = await getAdminEmails();
            if (adminEmails.length === 0) {
                console.error('[LeaveEmail] No admin email available; skipping leave request notification.');
                continue;
            }
            console.log(`[LeaveEmail] Sending leave request notification to ${adminEmails.join(', ')} for ${employeeName} (${toDateKey(notification.date)}).`);
            await sendLeaveRequestEmail.sendLeaveRequestToAdmin({ ...commonDetails, adminEmails });
        } else if (notification.type === LEAVE_EMAIL_TYPE.APPROVED) {
            console.log(`[LeaveEmail] Sending leave approval notification to ${employeeEmail} for ${toDateKey(notification.date)}.`);
            await sendLeaveRequestEmail.sendLeaveApprovalEmail(commonDetails);
        } else if (notification.type === LEAVE_EMAIL_TYPE.REJECTED) {
            console.log(`[LeaveEmail] Sending leave rejection notification to ${employeeEmail} for ${toDateKey(notification.date)}.`);
            await sendLeaveRequestEmail.sendLeaveRejectionEmail({
                ...commonDetails,
                rejectionReason: notification.rejectionReason
            });
        }
    }
};

export default { updateEmployeeTimesheet };
