import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { ICourseModule } from '../interfaces/coursemodule';

const CourseModuleSchema = new mongoose.Schema({
    moduleName: { type: mongoose.Schema.Types.String, unique: true },
    moduleDescription: { type: mongoose.Schema.Types.String },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseModel' },
},
    {
        collection: 'coursemodule',
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    });

CourseModuleSchema.virtual('tasks', {
    ref: 'CourseTaskModel',
    localField: '_id',
    foreignField: 'moduleId',
});

CourseModuleSchema.plugin(uniqueValidator);

const CourseModuleModel = mongoose.model<ICourseModule>('CourseModule', CourseModuleSchema);

export default CourseModuleModel;
