import mongoose, { Document } from 'mongoose';
import CourseAssignmentStatus from '../types/courseAssignment';

export interface ICourseAssignment  extends Document {
    courseId: mongoose.Schema.Types.ObjectId;
    employeeId: mongoose.Schema.Types.ObjectId;
    assignedByAdminId: mongoose.Schema.Types.ObjectId;
    status: CourseAssignmentStatus;
    assignedAt: Date;
    dueDate: Date;
    completedAt?: Date | null;
    taskAcknowledgements?: {
        taskId: mongoose.Schema.Types.ObjectId;
        acknowledged: boolean;
        acknowledgedAt?: Date | null;
    }[];
    lastReminderSentAt?: Date | null;
    reminderScheduleStartDate?: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export interface IAssignedCourseForEmployee {
    courseAssignmentId: string;
    courseId: string;
    courseName: string;
    description: string;
    status: string;
    assignedDate: Date;
    dueDate: Date;
    assignedBy: string;
}

export interface IFetchAssignedCoursesForEmployeeResponse {
    success: boolean;
    message: string;
    data: IAssignedCourseForEmployee[];
}

export interface ICourseAssignmentEmailDetails {
    employeeName: string;
    employeeEmail: string;
    courseName: string;
    courseDescription?: string;
    modules: { moduleName: string; moduleDescription?: string }[];
    dueDate: Date | string;
    assignedByAdminName?: string;
}

export interface ICourseCompletionEmailDetails {
    adminEmail: string;
    adminName?: string;
    employeeName: string;
    courseName: string;
    completedAt: Date | string;
}

export interface ICourseDueDateUpdateEmailDetails {
    employeeName: string;
    employeeEmail: string;
    courseName: string;
    oldDueDate: Date | string;
    newDueDate: Date | string;
    isExtended: boolean;
}

export interface ICourseReminderEmailDetails {
    employeeName: string;
    employeeEmail: string;
    courseName: string;
    dueDate: Date | string;
}
