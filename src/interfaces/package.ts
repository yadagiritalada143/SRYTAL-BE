import mongoose, { Document } from 'mongoose';

export interface IPackage extends Document {
    title?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    tasks?: mongoose.Schema.Types.Array;
    approvers?: mongoose.Schema.Types.Array;
}
