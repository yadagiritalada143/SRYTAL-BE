export interface ILeaveRequestEmailDetails {
    adminEmails?: string[];
    employeeName: string;
    employeeEmail: string;
    leaveReason: string;
    date: Date | string;
    status: string;
    rejectionReason?: string;
    leaveType?: string;
    startDate?: Date | string;
    endDate?: Date | string;
}
