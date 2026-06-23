import mongoose, { Document } from 'mongoose';

export interface ICourseTask extends Document {
    moduleId: mongoose.Schema.Types.ObjectId;
    taskName: string;
    taskDescription: string;
    thumbnail?: string;
    type: string;
    status?: string;
    content?: string;
    contentMimeType?: string;
    contentFileName?: string;
}

export interface IFetchCourseTaskContentResponse {
    success: boolean;
    task?: ICourseTask;
}

export interface IUpdateCourseTaskResponse {
    success: boolean;
    responseAfterUpdate?: any;
}
