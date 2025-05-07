import mongoose, { Document } from 'mongoose';

export interface IEmployeePackage extends Document {
    employeeId: mongoose.Schema.Types.ObjectId;
     packageId: mongoose.Schema.Types.ObjectId;
     startDate?: Date;
}

