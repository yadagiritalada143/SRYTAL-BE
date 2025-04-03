import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { ITask } from '../interfaces/task';
import UserModel from './userModel';
import PackagesModel from './packageModel';

const TaskSchema = new mongoose.Schema({
    title: { type: mongoose.Schema.Types.String, required: true, unique: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: UserModel },
    createdAt: { type: mongoose.Schema.Types.Date },
    lastUpdatedAt: { type: mongoose.Schema.Types.Date },
    isDeleted: { type: mongoose.Schema.Types.Boolean },
    packageId:{ type: mongoose.Schema.Types.ObjectId, ref: PackagesModel },
}, {
    collection: 'tasks',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

TaskSchema.plugin(uniqueValidator);

const TaskModel = mongoose.model<ITask>('TaskModel', TaskSchema);

export default TaskModel;
