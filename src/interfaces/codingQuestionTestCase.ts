import mongoose, { Document } from 'mongoose';

export interface ITestCase {
    name: string;
    input: string;
    expectedOutput: string;
    isSample?: boolean;
}

export interface ICodingQuestionTestCase extends Document {
    taskId: mongoose.Schema.Types.ObjectId;
    status: string;
    testCases: ITestCase[];
    generatedBy: string;
    generatedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}