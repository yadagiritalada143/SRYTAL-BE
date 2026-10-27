"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const CourseTaskCodeSubmissionSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'userModel', required: true, index: true },
    codingTaskId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'CourseTaskModel', required: true, index: true },
    language: { type: String, required: true },
    sourceCode: { type: String, required: true },
    testResults: [{
            testCaseId: { type: String, required: true },
            name: { type: String, required: true },
            status: { type: String, enum: ['PASSED', 'WRONG_OUTPUT', 'REQUEST_ERROR', 'COMPILE_ERROR', 'RUNTIME_ERROR', 'TIMEOUT', 'EXECUTION_ERROR'], required: true },
            passed: { type: Boolean, required: true },
            isHidden: { type: Boolean, default: false },
            expectedOutput: { type: String, default: '' },
            actualOutput: { type: String, default: '' },
            error: { type: String, default: null }
        }],
    score: { type: Number, default: null },
    submittedAt: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: ['SUBMITTED'], required: true, default: 'SUBMITTED' }
}, {
    collection: 'coding-course-task-submissions',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
CourseTaskCodeSubmissionSchema.index({ userId: 1, codingTaskId: 1, submittedAt: -1 });
const CourseTaskCodeSubmissionModel = mongoose_1.default.model('CourseTaskCodeSubmissionModel', CourseTaskCodeSubmissionSchema);
exports.default = CourseTaskCodeSubmissionModel;
