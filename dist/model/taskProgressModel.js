"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const TaskProgressSchema = new mongoose_1.default.Schema({
    courseAssignmentId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'CourseAssignment',
        required: true,
        index: true,
    },
    moduleId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'CourseModule',
        required: true,
        index: true,
    },
    taskId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'CourseTask',
        required: true,
        index: true,
    },
    isCompleted: {
        type: Boolean,
        default: false,
        required: true,
    },
    completedAt: {
        type: Date,
        default: null,
    },
}, {
    collection: 'task-progress',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
TaskProgressSchema.index({
    courseAssignmentId: 1,
    moduleId: 1,
    taskId: 1,
}, {
    unique: true,
});
TaskProgressSchema.plugin(mongoose_unique_validator_1.default);
const TaskProgressModel = mongoose_1.default.model('TaskProgress', TaskProgressSchema);
exports.default = TaskProgressModel;
