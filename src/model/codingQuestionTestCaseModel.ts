import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { ICodingQuestionTestCase } from '../interfaces/codingQuestionTestCase';

/**
 * Test cases for one question of a coding task, generated on the first Run Code
 * request via OpenRouter and then reused for every subsequent run by any
 * employee. A task now holds many questions, so the identity is the
 * (taskId, questionId) pair - the unique compound index guarantees a question can
 * only ever have one set of test cases while sibling questions stay independent.
 * `questionId` is null on rows written before the multi-question change, which is
 * exactly the value the legacy single-question read path resolves to.
 */
const CodingQuestionTestCaseSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseTaskModel', required: true },
    // No `ref`: the question is an embedded subdocument of the task, not a model of
    // its own, so there is nothing for populate() to resolve against.
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
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
        collection: 'coding-task-test-cases',
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    });

CodingQuestionTestCaseSchema.index(
    {
        taskId: 1,
        questionId: 1
    },
    {
        unique: true
    }
);

CodingQuestionTestCaseSchema.plugin(uniqueValidator);

const CodingQuestionTestCaseModel = mongoose.model<ICodingQuestionTestCase>(
    'CodingQuestionTestCaseModel',
    CodingQuestionTestCaseSchema
);

export default CodingQuestionTestCaseModel;
