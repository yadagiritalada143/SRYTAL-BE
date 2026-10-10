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
    /**
     * Marks the case as hidden from the student. Hidden cases may still be
     * executed (and compared) on the backend, but their input, expected output
     * and other derived details must never be returned by the API.
     *
     * Defaults to `false` (visible) so existing/generated cases keep their
     * current contract.
     */
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
