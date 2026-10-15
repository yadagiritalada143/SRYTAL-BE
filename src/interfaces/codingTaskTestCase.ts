import mongoose, { Document } from 'mongoose';

export type CodingTaskTestCaseCategory =
    | 'basic'
    | 'edge'
    | 'boundary'
    | 'minimum'
    | 'maximum'
    | 'single-element'
    | 'empty'
    | 'duplicate'
    | 'negative'
    | 'large'
    | 'special'
    | 'incorrect-solution';

export interface ICodingTaskTestCase {
    id: string;
    name: string;
    input: string;
    expectedOutput: string;
    category: CodingTaskTestCaseCategory;
    isHidden?: boolean;
}

export interface ICodingTaskTestCaseSet extends Document {
    taskId: mongoose.Types.ObjectId;
    taskDescriptionHash?: string;
    status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
    testCases: ICodingTaskTestCase[];
    generatedBy: string;
    generatedAt?: Date | null;
    updatedAt?: Date;
}
