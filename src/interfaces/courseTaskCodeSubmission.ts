import { Document, Types } from 'mongoose';
import { IRunCourseTaskCodeTestResult } from './runCourseTaskCode';

export interface ICourseTaskCodeSubmission extends Document {
    userId: Types.ObjectId;
    codingTaskId: Types.ObjectId;
    language: string;
    sourceCode: string;
    testResults: IRunCourseTaskCodeTestResult[];
    score: number | null;
    submittedAt: Date;
    status: 'SUBMITTED';
}

export interface ISubmitCourseTaskCodeResponse {
    submitted: boolean;
    canSubmit: boolean;
    message: string;
    submission?: {
        id: string;
        score: number | null;
        submittedAt: Date;
        status: 'SUBMITTED';
    };
}
