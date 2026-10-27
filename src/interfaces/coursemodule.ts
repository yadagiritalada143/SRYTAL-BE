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

export interface IReorderCourseModuleItem {
    moduleId: string;
    orderIdx: number;
}

export type ReorderCourseModulesErrorCode =
    | 'INVALID_COURSE_ID'
    | 'COURSE_NOT_FOUND'
    | 'INVALID_MODULES'
    | 'INVALID_MODULE_ID'
    | 'MODULE_NOT_FOUND'
    | 'MODULE_NOT_IN_COURSE'
    | 'DUPLICATE_MODULE_ID'
    | 'INVALID_ORDER_IDX'
    | 'DUPLICATE_ORDER_IDX'
    | 'REORDER_FAILED';

export interface IReorderCourseModulesResponse {
    success: boolean;
    errorCode?: ReorderCourseModulesErrorCode;
    data?: any;
}
