import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import {ICourses} from '../interfaces/courses';

const CoursesSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    courseName:{ type: mongoose.Schema.Types.String, unique: true },
    courseDescription: { type: mongoose.Schema.Types.String }
},
{
    collection: 'courses',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

CoursesSchema.plugin(uniqueValidator);

const CourseModel = mongoose.model<ICourses>('CourseModel', CoursesSchema);

export default CourseModel;
