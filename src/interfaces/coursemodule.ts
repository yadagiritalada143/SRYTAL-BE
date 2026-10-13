import mongoose, { Document } from 'mongoose';

export interface ICourseModule extends Document {
    moduleName: string;
    moduleDescription: string;
    courseId: mongoose.Schema.Types.ObjectId;
    thumbnail?: string;
}

export interface IUpdateCourseModuleResponse {
    success: boolean;
    responseAfterModuleUpdate?: any;
}
