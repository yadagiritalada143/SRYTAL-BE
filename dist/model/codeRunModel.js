"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * One Run Code execution made by an employee against a coding question. Each
 * result entry corresponds to a single generated test case, so the run history
 * doubles as an audit trail of every employee submission.
 */
const CodeRunSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'userModel', required: true, index: true },
    taskId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'CourseTaskModel', required: true, index: true },
    language: { type: mongoose_1.default.Schema.Types.String, required: true },
    sourceCode: { type: mongoose_1.default.Schema.Types.String, required: true },
    results: [{
            name: { type: mongoose_1.default.Schema.Types.String },
            input: { type: mongoose_1.default.Schema.Types.String },
            expectedOutput: { type: mongoose_1.default.Schema.Types.String },
            actualOutput: { type: mongoose_1.default.Schema.Types.String },
            passed: { type: mongoose_1.default.Schema.Types.Boolean },
            status: { type: mongoose_1.default.Schema.Types.String },
            stderr: { type: mongoose_1.default.Schema.Types.String },
            compilationError: { type: mongoose_1.default.Schema.Types.String },
            runtimeError: { type: mongoose_1.default.Schema.Types.String },
            executionTimeMs: { type: mongoose_1.default.Schema.Types.Number },
            errorDetails: { type: mongoose_1.default.Schema.Types.String }
        }],
    passedCount: { type: mongoose_1.default.Schema.Types.Number, default: 0 },
    failedCount: { type: mongoose_1.default.Schema.Types.Number, default: 0 },
    score: { type: mongoose_1.default.Schema.Types.Number, default: 0 },
    aiEvaluation: { type: mongoose_1.default.Schema.Types.Mixed, default: null },
    status: { type: mongoose_1.default.Schema.Types.String, default: 'PENDING' },
    type: { type: mongoose_1.default.Schema.Types.String, enum: ['run', 'submit'], default: 'run', index: true }
}, {
    collection: 'code-run',
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
const CodeRunModel = mongoose_1.default.model('CodeRunModel', CodeRunSchema);
exports.default = CodeRunModel;
