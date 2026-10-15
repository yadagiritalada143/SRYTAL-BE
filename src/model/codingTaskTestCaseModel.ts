import mongoose from 'mongoose';
import { ICodingTaskTestCaseSet } from '../interfaces/codingTaskTestCase';

const CodingTaskTestCaseSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        name: { type: String, required: true },
        input: { type: String, default: '' },
        expectedOutput: { type: String, default: '' },
        isHidden: { type: Boolean, default: false },
        category: {
            type: String,
            enum: [
                'basic',
                'edge',
                'boundary',
                'minimum',
                'maximum',
                'single-element',
                'empty',
                'duplicate',
                'negative',
                'large',
                'special',
                'incorrect-solution'
            ],
            required: true
        }
    },
    { _id: false }
);

const CodingTaskTestCaseSetSchema = new mongoose.Schema(
    {
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CourseTaskModel',
            required: true,
            unique: true
        },
        taskDescriptionHash: { type: String },
        status: {
            type: String,
            enum: ['PENDING', 'GENERATING', 'COMPLETED', 'FAILED'],
            default: 'PENDING'
        },
        testCases: { type: [CodingTaskTestCaseSchema], default: [] },
        generatedBy: { type: String, default: 'OpenRouter' },
        generatedAt: { type: Date, default: null }
    },
    {
        collection: 'coding-course-task-test-cases',
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
);

const CodingTaskTestCaseModel = mongoose.model<ICodingTaskTestCaseSet>(
    'CodingTaskTestCaseModel',
    CodingTaskTestCaseSetSchema
);

export default CodingTaskTestCaseModel;
