import mongoose, { Document } from 'mongoose';

export interface ITestCase {
    name: string;
    input: string;
    expectedOutput: string;
    isSample?: boolean;
}

export interface ICodingQuestionTestCase extends Document {
    taskId: mongoose.Schema.Types.ObjectId;
    /** Id of the question within the task; null on rows written before multi-question tasks. */
    questionId?: mongoose.Schema.Types.ObjectId | null;
    status: string;
    testCases: ITestCase[];
    generatedBy: string;
    generatedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}