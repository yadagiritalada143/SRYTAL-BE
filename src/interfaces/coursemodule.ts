import mongoose, { Document } from 'mongoose';

export interface ICourseModule extends Document {
    moduleName: string;
    moduleDescription: string;
    courseId: mongoose.Schema.Types.ObjectId;
    thumbnail?: string;
    orderIdx: Number,
}

export interface IUpdateCourseModuleResponse {
    success: boolean;
    responseAfterModuleUpdate?: any;
    message?: string;
    data?: any;
}

export interface IAddCourseModuleResponse {
    success: boolean;
    message?: string;
    data?: any;
}
