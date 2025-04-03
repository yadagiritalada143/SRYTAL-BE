import mongoose, { Document } from 'mongoose';

export interface IPackage extends Document {
    title?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    approvers?: mongoose.Schema.Types.Array;
}
