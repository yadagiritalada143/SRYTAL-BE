import mongoose, { Document } from 'mongoose';

export interface ITask extends Document {
    title?: string;
    createdBy: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    lastUpdatedAt: Date;
}
