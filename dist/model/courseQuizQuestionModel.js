"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const courseQuizQuestiontype_1 = require("../types/courseQuizQuestiontype");
const OPTION_TYPES = courseQuizQuestiontype_1.COURSE_QUIZ_QUESTION_TYPES;
const STATUS_TYPES = courseQuizQuestiontype_1.COURSE_QUIZ_QUESTION_STATUSES;
const CourseQuizQuestionOptionSchema = new mongoose_1.default.Schema({
    value: { type: mongoose_1.default.Schema.Types.String, required: true, trim: true },
    isanswer: { type: mongoose_1.default.Schema.Types.Boolean, default: false },
}, { _id: false });
const CourseQuizQuestionSchema = new mongoose_1.default.Schema({
    taskId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'CourseTaskModel', required: true, index: true },
    question: { type: mongoose_1.default.Schema.Types.String, required: true, trim: true },
    type: { type: mongoose_1.default.Schema.Types.String, enum: OPTION_TYPES, required: true },
    options: { type: [CourseQuizQuestionOptionSchema], default: undefined },
    isDeleted: { type: mongoose_1.default.Schema.Types.Boolean, default: false, index: true },
    status: { type: mongoose_1.default.Schema.Types.String, enum: STATUS_TYPES, default: 'SHOW' },
}, {
    collection: 'course-quiz-questions',
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});
CourseQuizQuestionSchema.index({ taskId: 1, isDeleted: 1, createdAt: 1 });
CourseQuizQuestionSchema.index({ taskId: 1, isDeleted: 1, question: 1 });
const CourseQuizQuestionModel = mongoose_1.default.model('CourseQuizQuestionModel', CourseQuizQuestionSchema);
exports.default = CourseQuizQuestionModel;
