import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { ITask } from '../interfaces/task';

const TaskSchema = new mongoose.Schema({
    taskTitle: { type: mongoose.Schema.Types.String, required: true, unique: true },

}, {
    collection: 'Tasks',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

TaskSchema.plugin(uniqueValidator);

const TaskModel = mongoose.model<ITask>('TaskModel', TaskSchema);
export default TaskModel;
