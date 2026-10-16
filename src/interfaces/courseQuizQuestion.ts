import mongoose, { Document } from 'mongoose';
import { CourseQuizQuestionType, CourseQuizQuestionStatus} from '../types/courseQuizQuestiontype'

export interface ICourseQuizQuestionOption {
    value: string;
    isanswer?: boolean;
}

export interface ICourseQuizQuestion extends Document {
    taskId: mongoose.Schema.Types.ObjectId;
    question: string;
    type: CourseQuizQuestionType;
    options?: ICourseQuizQuestionOption[];
    isDeleted: boolean;
    status: CourseQuizQuestionStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ICreateQuizQuestionResponse {
    success: boolean;
    question?: any;
    taskNotFound?: boolean;
    notQuizTask?: boolean;
    duplicateQuestion?: boolean;
    invalidQuestion?: boolean;
    invalidQuestionType?: boolean;
    invalidOptions?: boolean;
    invalidStatus?: boolean;
    invalidQuestionId?: boolean;
    questionNotFound?: boolean;
    message?: string;
}

export interface ICourseQuizQuestionResponse {
    success: boolean;
    question?: any;
    duplicateQuestion?: boolean;
    invalidQuestion?: boolean;
    invalidQuestionType?: boolean;
    invalidOptions?: boolean;
    invalidStatus?: boolean;
    invalidQuestionId?: boolean;
    questionNotFound?: boolean;
    taskNotFound?: boolean;
    notQuizTask?: boolean;
    message?: string;
}

export interface IFetchAllQuizQuestionsResponse {
    success: boolean;
    questions?: any[];
    taskNotFound?: boolean;
    notQuizTask?: boolean;
}

export interface IFetchQuizQuestionByIdResponse {
    success: boolean;
    question?: any;
    questionNotFound?: boolean;
}
