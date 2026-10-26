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
    orderIdx?: number;
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

export interface IReorderCourseTaskItem {
    taskId: string;
    orderIdx: number;
}

export type ReorderCourseTasksErrorCode =
    | 'INVALID_MODULE_ID'
    | 'MODULE_NOT_FOUND'
    | 'INVALID_TASKS'
    | 'INVALID_TASK_ID'
    | 'TASK_NOT_FOUND'
    | 'TASK_NOT_IN_MODULE'
    | 'DUPLICATE_TASK_ID'
    | 'INVALID_ORDER_IDX'
    | 'DUPLICATE_ORDER_IDX'
    | 'REORDER_FAILED';

export interface IReorderCourseTasksResponse {
    success: boolean;
    errorCode?: ReorderCourseTasksErrorCode;
    data?: any;
}
