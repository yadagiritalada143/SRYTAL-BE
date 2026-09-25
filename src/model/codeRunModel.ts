import mongoose from 'mongoose';
import { ICodeRun } from '../interfaces/codeRun';

/**
 * Latest run snapshot and submission snapshots made by an employee against a
 * coding question. Each result entry corresponds to a single generated test case.
 */
const CodeRunSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'userModel', required: true, index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseTaskModel', required: true, index: true },
    languageId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProgrammingLanguagesSchema', required: true },
    sourceCode: { type: mongoose.Schema.Types.String, required: true },
    results: [{
        name: { type: mongoose.Schema.Types.String },
        input: { type: mongoose.Schema.Types.String },
        expectedOutput: { type: mongoose.Schema.Types.String },
        actualOutput: { type: mongoose.Schema.Types.String },
        passed: { type: mongoose.Schema.Types.Boolean },
        status: { type: mongoose.Schema.Types.String },
        stderr: { type: mongoose.Schema.Types.String },
        compilationError: { type: mongoose.Schema.Types.String },
        runtimeError: { type: mongoose.Schema.Types.String },
        executionTimeMs: { type: mongoose.Schema.Types.Number },
        errorDetails: { type: mongoose.Schema.Types.String }
    }],
    passedCount: { type: mongoose.Schema.Types.Number, default: 0 },
    failedCount: { type: mongoose.Schema.Types.Number, default: 0 },
    score: { type: mongoose.Schema.Types.Number, default: 0 },
    aiEvaluation: { type: mongoose.Schema.Types.Mixed, default: null },
    status: { type: mongoose.Schema.Types.String, default: 'PENDING' },
    type: { type: mongoose.Schema.Types.String, enum: ['run', 'submit'], default: 'run', index: true }
},
    {
        collection: 'code-executions',
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    });

const CodeRunModel = mongoose.model<ICodeRun>('CodeRunModel', CodeRunSchema);

export default CodeRunModel;