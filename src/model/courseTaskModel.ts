import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { ICourseTask } from '../interfaces/courseTask';

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
},
    {
        collection: 'coursetask',
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    });

CourseTaskSchema.plugin(uniqueValidator);

const CourseTaskModel = mongoose.model<ICourseTask>('CourseTaskModel', CourseTaskSchema);

export default CourseTaskModel;
