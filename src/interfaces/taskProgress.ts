import mongoose, { Document } from 'mongoose';

export interface ITaskProgress extends Document {
    courseAssignmentId:mongoose.Schema.Types.ObjectId;
    moduleId: mongoose.Schema.Types.ObjectId;
    taskId: mongoose.Schema.Types.ObjectId;
    isCompleted: boolean;
    completedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}