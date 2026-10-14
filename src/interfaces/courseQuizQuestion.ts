import mongoose, { Document } from 'mongoose';

export type CourseQuizQuestionType = 'RADIO' | 'CHECKBOX' | 'TOGGLE' | 'DROPDOWN' | 'TEXTAREA';

export type CourseQuizQuestionStatus = 'SHOW' | 'HIDE';

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
}

export interface IFetchAllQuizQuestionsResponse {
    success: boolean;
    questions?: any[];
    taskNotFound?: boolean;
    notQuizTask?: boolean;
}
