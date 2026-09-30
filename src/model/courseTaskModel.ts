import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { ICourseTask } from '../interfaces/courseTask';

/**
 * One coding question inside a task. A task can hold many of these and every one
 * of them is graded on its own - it owns its test cases, its submissions and its
 * per-language starter code (which doubles as the cache for the AI-generated
 * boilerplate). `questionId` is the identity used together with the task id by
 * the satellite collections, so two questions in the same task never collide.
 */
const CourseTaskQuestionSchema = new mongoose.Schema(
    {
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            default: () => new mongoose.Types.ObjectId()
        },
        question: { type: mongoose.Schema.Types.String, required: true },
        description: { type: mongoose.Schema.Types.String, default: '' },
        status: { type: mongoose.Schema.Types.String, default: 'ACTIVE' },
        order: { type: mongoose.Schema.Types.Number, default: 0 },
        starterCode: [{
            languageName: { type: mongoose.Schema.Types.String },
            code: { type: mongoose.Schema.Types.String }
        }]
    },
    {
        _id: false,
        timestamps: true
    }
);

const CourseTaskSchema = new mongoose.Schema({
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseModuleModel', required: true },
    taskName: { type: mongoose.Schema.Types.String, required: true, unique: true },
    taskDescription: { type: mongoose.Schema.Types.String },
    thumbnail: { type: mongoose.Schema.Types.String },
    status: { type: mongoose.Schema.Types.String },
    type: { type: mongoose.Schema.Types.String },
    // Reference to the task content. For type 'LINK' this is the external URL
    // (YouTube, blog, etc). For type 'FILE' this is the S3 object key of the
    // uploaded file (pdf/word/any). Served back via /getCourseTaskContent/:id.
    content: { type: mongoose.Schema.Types.String },
    contentMimeType: { type: mongoose.Schema.Types.String },
    contentFileName: { type: mongoose.Schema.Types.String },
    isCoding: { type: mongoose.Schema.Types.Boolean, default: false },
    questions: { type: [CourseTaskQuestionSchema], default: [] },
    // LEGACY (kept for one release): superseded by questions[]. Every read goes
    // through util/courseTaskQuestions, which only falls back to these two
    // fields for documents written before the multi-question change. They are
    // removed together with the fallback once no client depends on them.
    question: { type: mongoose.Schema.Types.String },
    starterCode: [{
        languageName: { type: mongoose.Schema.Types.String },
        code: { type: mongoose.Schema.Types.String }
    }],
},
    {
        collection: 'coursetask',
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    });

CourseTaskSchema.plugin(uniqueValidator);

// getquestion looks a task up from one of its embedded question ids.
CourseTaskSchema.index({ 'questions.questionId': 1 });

const CourseTaskModel = mongoose.model<ICourseTask>('CourseTaskModel', CourseTaskSchema);

export default CourseTaskModel;
