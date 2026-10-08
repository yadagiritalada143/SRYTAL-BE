import mongoose, { Document } from 'mongoose';

/** Generated starter code cached on a coding task for one programming language. */
export interface ICourseTaskStarterCode {
    languageId: mongoose.Types.ObjectId | string;
    code: string;
}

export interface ICourseTask extends Document {
    moduleId: mongoose.Schema.Types.ObjectId;
    taskName: string;
    taskDescription: string;
    thumbnail?: string;
    type?: string;
    status?: string;
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
