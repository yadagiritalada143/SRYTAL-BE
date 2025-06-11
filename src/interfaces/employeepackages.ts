import mongoose, { Date, Document } from 'mongoose';

export interface IEmployeePackage extends Document {
    employeeId: mongoose.Schema.Types.ObjectId;
    packages: [
        {
            packageId: mongoose.Schema.Types.ObjectId,
            tasks: [
                {
                    taskId: mongoose.Schema.Types.ObjectId, timesheet: [
                        {
                            date: Date,
                            isHoliday: boolean,
                            isVacation: boolean,
                            isWeekOff: boolean,
                            hours: number,
                            comments: string,
                            leaveReason: string

                        }
                    ]
                }
            ]
        }
    ]
    startDate?: Date;
}

