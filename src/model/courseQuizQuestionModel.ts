import mongoose from 'mongoose';
import { ICourseQuizQuestion } from '../interfaces/courseQuizQuestion';
import { CourseQuizQuestionType, CourseQuizQuestionStatus } from '../types/courseQuizQuestiontype';

const OPTION_TYPES: CourseQuizQuestionType[] = ['RADIO', 'CHECKBOX', 'TOGGLE', 'DROPDOWN', 'TEXTAREA'];
const STATUS_TYPES: CourseQuizQuestionStatus[] = ['SHOW', 'HIDE'];

const CourseQuizQuestionOptionSchema = new mongoose.Schema(
    {
        value: { type: mongoose.Schema.Types.String, required: true, trim: true },
        isanswer: { type: mongoose.Schema.Types.Boolean, default: false },
    },
    { _id: false }
);

const CourseQuizQuestionSchema = new mongoose.Schema(
    {
        taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseTaskModel', required: true, index: true },
        question: { type: mongoose.Schema.Types.String, required: true, trim: true },
        type: { type: mongoose.Schema.Types.String, enum: OPTION_TYPES, required: true },
        options: { type: [CourseQuizQuestionOptionSchema], default: undefined },
        isDeleted: { type: mongoose.Schema.Types.Boolean, default: false, index: true },
        status: { type: mongoose.Schema.Types.String, enum: STATUS_TYPES, default: 'SHOW' },
    },
    {
        collection: 'course-quiz-questions',
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    }
);

CourseQuizQuestionSchema.index({ taskId: 1, isDeleted: 1, createdAt: 1 });

CourseQuizQuestionSchema.index({ taskId: 1, isDeleted: 1, question: 1 });

const CourseQuizQuestionModel = mongoose.model<ICourseQuizQuestion>('CourseQuizQuestionModel', CourseQuizQuestionSchema);

export default CourseQuizQuestionModel;
