import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { ICourseModule } from '../interfaces/coursemodule';

const CourseModuleSchema = new mongoose.Schema({
    moduleName: { type: mongoose.Schema.Types.String, unique: true },
    moduleDescription: { type: mongoose.Schema.Types.String },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseModel' },
    thumbnail: { type: mongoose.Schema.Types.String },
    status: { type: mongoose.Schema.Types.String },
    orderIdx: { type: mongoose.Schema.Types.Number,  required: true, min: 1 }
},
    {
        collection: 'coursemodule',
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    });

CourseModuleSchema.virtual('tasks', {
    ref: 'CourseTaskModel',
    localField: '_id',
    foreignField: 'moduleId',
});

CourseModuleSchema.plugin(uniqueValidator);

CourseModuleSchema.index({ courseId: 1, createdAt: 1, _id: 1 });

const CourseModuleModel = mongoose.model<ICourseModule>('CourseModule', CourseModuleSchema);

export default CourseModuleModel;
