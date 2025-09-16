import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { ICourseTask } from '../interfaces/courseTask';

const CourseTaskSchema = new mongoose.Schema({
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseModuleModel', required: true },
    taskName: { type: mongoose.Schema.Types.String, required: true, unique: true },
    taskDescription: { type: mongoose.Schema.Types.String },
    thumbnail: { type: mongoose.Schema.Types.String },
    status: { type: mongoose.Schema.Types.String },
},
    {
        collection: 'coursetask',
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    });

CourseTaskSchema.plugin(uniqueValidator);

const CourseTaskModel = mongoose.model<ICourseTask>('CourseTaskModel', CourseTaskSchema);

export default CourseTaskModel;
