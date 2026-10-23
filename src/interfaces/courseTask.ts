import mongoose, { Document } from 'mongoose';

export interface ICourseTaskStarterCode {
    languageId: mongoose.Types.ObjectId | string;
    code: string;
    boilerplateVersion?: number;
}

export interface ICourseTask extends Document {
    moduleId: mongoose.Schema.Types.ObjectId;
    taskName: string;
    taskDescription: string;
    thumbnail?: string;
    type?: string;
    status?: string;
    executionMode?: 'CALLABLE' | 'STDIN' | 'UNCONFIGURED';
    content?: string;
    contentMimeType?: string;
    contentFileName?: string;
    baseBoilerplate?: string;
    starterCode?: ICourseTaskStarterCode[];
}

export interface IFetchCourseTaskContentResponse {
    success: boolean;
    task?: ICourseTask;
}

export interface IUpdateCourseTaskResponse {
    success: boolean;
    responseAfterUpdate?: any;
}

export interface IAddCourseTaskResponse {
    success: boolean;
    message?: string;
    data?: any;
}
