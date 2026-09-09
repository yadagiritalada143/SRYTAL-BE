import mongoose, { Document } from 'mongoose';

export interface ILeave extends Document {
    employeeId: mongoose.Schema.Types.ObjectId;
    leaveType: string;
    startDate: Date;
    endDate: Date;
    numberOfDays: number;
    reason?: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    rejectionReason?: string;
    notificationEmailSent?: boolean;
    employeeNotificationEmailSent?: boolean;
    createdAt: Date;
    updatedAt: Date;
};
