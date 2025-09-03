import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { ICourseTask } from '../interfaces/courseTask';
import CourseModuleModel from './coursemoduleModel';
import { required } from 'joi';



const CourseTaskSchema = new mongoose.Schema({
    taskName: { type: mongoose.Schema.Types.String, required: true, unique: true },
    taskDescription: { type: mongoose.Schema.Types.String },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: CourseModuleModel }
},
    {
        collection: 'coursetask',
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    });

CourseTaskSchema.plugin(uniqueValidator);

const CourseTaskModel = mongoose.model<ICourseTask>('ICourseTask', CourseTaskSchema);

export default CourseTaskModel;
