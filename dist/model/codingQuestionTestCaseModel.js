"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
/**
 * Test cases for one coding question, generated on the first Run Code request
 * via OpenRouter and then reused for every subsequent run by any employee.
 * The unique taskId index guarantees a coding question can only ever have one
 * set of test cases.
 */
const CodingQuestionTestCaseSchema = new mongoose_1.default.Schema({
    taskId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'CourseTaskModel', required: true, unique: true },
    status: { type: mongoose_1.default.Schema.Types.String, default: 'PENDING' },
    testCases: [{
            name: { type: mongoose_1.default.Schema.Types.String, required: true },
            input: { type: mongoose_1.default.Schema.Types.String, required: true },
            expectedOutput: { type: mongoose_1.default.Schema.Types.String, required: true },
            isSample: { type: mongoose_1.default.Schema.Types.Boolean, default: false }
        }],
    generatedBy: { type: mongoose_1.default.Schema.Types.String, default: 'OpenRouter' },
    generatedAt: { type: mongoose_1.default.Schema.Types.Date, default: null }
}, {
    collection: 'coding-question-testcases',
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
CodingQuestionTestCaseSchema.plugin(mongoose_unique_validator_1.default);
const CodingQuestionTestCaseModel = mongoose_1.default.model('CodingQuestionTestCaseModel', CodingQuestionTestCaseSchema);
exports.default = CodingQuestionTestCaseModel;
