import mongoose, { Document } from 'mongoose';

export interface ITimesheet {
    date: Date;
    isHoliday: boolean;
    isVacation: boolean;
    isWeekOff: boolean;
    hours: number;
    comments: string;
    leaveReason: string;
}

export interface ITask {
    taskId: mongoose.Schema.Types.ObjectId;
    startDate: Date;
    timesheet: ITimesheet[];
}

export interface IPackage {
    packageId: mongoose.Schema.Types.ObjectId;
    tasks: ITask[];
}

export interface IEmployeePackage extends Document {
    employeeId: mongoose.Schema.Types.ObjectId;
    packages: IPackage[];
}

export interface UpdateEmployeeTimesheetResponse {
    success: boolean;
    responseAfterUpdateTimesheet?: any;
    message?: string;
}

export interface TimesheetUpdate extends Partial<ITimesheet> {
    date: Date;
    _id?: mongoose.Types.ObjectId;
}

export interface TaskUpdate {
    taskId: string | mongoose.Types.ObjectId;
    timesheet: TimesheetUpdate[];
}

export interface PackageUpdate {
    packageId: string | mongoose.Types.ObjectId;
    tasks: TaskUpdate[];
}

export interface UpdateTimesheetPayload {
    employeeId: string | mongoose.Types.ObjectId;
    packages: PackageUpdate[];
}
