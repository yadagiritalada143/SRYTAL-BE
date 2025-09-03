import mongoose, { Document } from 'mongoose';

export interface ICourseTask extends Document {
    taskName: string;
    taskDescription: string;
    moduleId: mongoose.Schema.Types.ObjectId;
}
