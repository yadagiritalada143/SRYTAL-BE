import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { ICodingQuestionTestCase } from '../interfaces/codingQuestionTestCase';

/**
 * Test cases for one coding question, generated on the first Run Code request
 * via OpenRouter and then reused for every subsequent run by any employee.
 * The unique taskId index guarantees a coding question can only ever have one
 * set of test cases.
 */
const CodingQuestionTestCaseSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseTaskModel', required: true, unique: true },
    status: { type: mongoose.Schema.Types.String, default: 'PENDING' },
    testCases: [{
        name: { type: mongoose.Schema.Types.String, required: true },
        input: { type: mongoose.Schema.Types.String, required: true },
        expectedOutput: { type: mongoose.Schema.Types.String, required: true },
        isSample: { type: mongoose.Schema.Types.Boolean, default: false }
    }],
    generatedBy: { type: mongoose.Schema.Types.String, default: 'OpenRouter' },
    generatedAt: { type: mongoose.Schema.Types.Date, default: null }
},
    {
        collection: 'coding-question-testcases',
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    });

CodingQuestionTestCaseSchema.plugin(uniqueValidator);

const CodingQuestionTestCaseModel = mongoose.model<ICodingQuestionTestCase>(
    'CodingQuestionTestCaseModel',
    CodingQuestionTestCaseSchema
);

export default CodingQuestionTestCaseModel;