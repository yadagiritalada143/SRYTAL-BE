import mongoose, { Document } from 'mongoose';

export interface ITask extends Document {
    title?: string;
    createdBy: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    lastUpdatedAt: Date;
    packageId: mongoose.Schema.Types.ObjectId;
}

export interface IDeleteTaskResponse {
    success: boolean;
}

export interface IUpdateTaskResponse {
    success: boolean;
    responseAfterUpdate?: any;
}
