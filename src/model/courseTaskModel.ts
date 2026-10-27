import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { ICourseTask } from '../interfaces/courseTask';

const CourseTaskSchema = new mongoose.Schema({
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseModuleModel', required: true },
    taskName: { type: mongoose.Schema.Types.String, required: true, unique: true },
    taskDescription: { type: mongoose.Schema.Types.String },
    thumbnail: { type: mongoose.Schema.Types.String },
    status: { type: mongoose.Schema.Types.String, enum: ['ACTIVE', 'ARCHIVE'], default: 'ACTIVE' },
    type: { type: mongoose.Schema.Types.String, enum: ['CODE', 'QUIZ', 'LINK', 'FILE'] },
    executionMode: { type: mongoose.Schema.Types.String, enum: ['CALLABLE', 'STDIN', 'UNCONFIGURED'], default: 'UNCONFIGURED' },
    content: { type: mongoose.Schema.Types.String },
    contentMimeType: { type: mongoose.Schema.Types.String },
    contentFileName: { type: mongoose.Schema.Types.String },
    acknowledgementText: { type: mongoose.Schema.Types.String, trim: true },
    baseBoilerplate: { type: mongoose.Schema.Types.String },
    boilerplateVersion: { type: mongoose.Schema.Types.Number, default: 0 },
    starterCode: [{
        languageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProgrammingLanguagesSchema',
            required: true
        },
        code: { type: mongoose.Schema.Types.String, required: true },
    }],
    orderIdx: { type: mongoose.Schema.Types.Number,  required: true, min: 1 }
},
    {
        collection: 'coursetask',
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
);

CourseTaskSchema.plugin(uniqueValidator);

CourseTaskSchema.index({ moduleId: 1, createdAt: 1, _id: 1 });

const CourseTaskModel = mongoose.model<ICourseTask>('CourseTaskModel', CourseTaskSchema);

export default CourseTaskModel;
