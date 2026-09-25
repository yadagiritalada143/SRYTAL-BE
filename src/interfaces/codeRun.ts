import mongoose, { Document } from 'mongoose';
import { ICodeRunTestCaseResult, IAiCodeQualityEvaluation } from './codingQuestion';

export interface ICodeRun extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    taskId: mongoose.Schema.Types.ObjectId;
    language: string;
    sourceCode: string;
    results: ICodeRunTestCaseResult[];
    passedCount: number;
    failedCount: number;
    score: number;
    aiEvaluation: IAiCodeQualityEvaluation | null;
    status: string;
    type: 'run' | 'submit';
    createdAt?: Date;
    updatedAt?: Date;
}