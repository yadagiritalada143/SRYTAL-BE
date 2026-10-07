import mongoose, { Document } from 'mongoose';

/**
 * A per-language starter skeleton for one question. Writer-supplied entries and
 * AI-generated ones (OpenRouter) share this array; the language key is the
 * canonical runtime key, e.g. 'javascript' or 'python'.
 */
export interface ICourseTaskStarterCode {
    languageName: string;
    code: string;
}

/**
 * One coding question belonging to a course task. `questionId` is paired with the
 * task id to address the satellite collections (test cases, code executions), so
 * it must stay stable for the lifetime of the question. It is null only for the
 * synthesized entry produced by the legacy single-question fallback.
 */
export interface ICourseTaskQuestion {
    questionId: mongoose.Schema.Types.ObjectId | string | null;
    question: string;
    description?: string;
    status?: string;
    order?: number;
    starterCode?: ICourseTaskStarterCode[];
    createdAt?: Date;
    updatedAt?: Date;
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
}

export interface IFetchCourseTaskContentResponse {
    success: boolean;
    task?: ICourseTask;
}

export interface IUpdateCourseTaskResponse {
    success: boolean;
    responseAfterUpdate?: any;
}

export interface IAddCourseTaskQuestionInput {
    taskId: string;
    question: string;
    description?: string;
}

export interface IAddCourseTaskQuestionResponse {
    success: boolean;
    taskId?: string;
    questionId?: string | null;
    questionCount?: number;
    // Set when the task does not exist.
    notFound?: boolean;
    // Set when the task exists but is not a coding task.
    notCodingTask?: boolean;
    // Set when the task already holds the maximum number of questions.
    limitReached?: boolean;
    // Set when the same question text is already on the task.
    duplicateQuestion?: boolean;
}

export interface IUpdateCourseTaskQuestionResponse {
    success: boolean;
    taskId?: string;
    questionId?: string | null;
    // Set when the task does not exist.
    notFound?: boolean;
    // Set when the task exists but is not a coding task.
    notCodingTask?: boolean;
    // Set when no question with the given id lives on the task.
    questionNotFound?: boolean;
    // Set when a renamed question collides with another question's text.
    duplicateQuestion?: boolean;
}

export interface IDeleteCourseTaskQuestionResponse {
    success: boolean;
    taskId?: string;
    questionId?: string | null;
    questionCount?: number;
    notFound?: boolean;
    notCodingTask?: boolean;
    questionNotFound?: boolean;
}

export interface IFetchCourseTaskQuestionsResponse {
    success: boolean;
    taskId?: string;
    taskName?: string;
    isCoding?: boolean;
    questions?: ICourseTaskQuestion[];
    questionCount?: number;
    activeQuestionCount?: number;
    notFound?: boolean;
}
