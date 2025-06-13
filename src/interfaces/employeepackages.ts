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
