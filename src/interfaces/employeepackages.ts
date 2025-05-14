
import mongoose, { Document } from 'mongoose';

export interface IEmployeePackage extends Document {
    employeeId: mongoose.Schema.Types.ObjectId;
     packages: [
        packageId: mongoose.Schema.Types.ObjectId,
        tasks: [
            taskId: mongoose.Schema.Types.ObjectId
        ]
     ]
     startDate?: Date;
     createdAt?: Date;
     currentMonthLastDay?: String;
    
}

