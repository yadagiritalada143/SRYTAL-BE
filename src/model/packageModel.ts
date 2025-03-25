import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import TaskModel from '../model/taskModel';
import { IPackage } from '../interfaces/package';

const PackagesSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    title: { type: mongoose.Schema.Types.String, required: true, unique: true },
    description: { type: mongoose.Schema.Types.String },
    startDate: { type: mongoose.Schema.Types.Date },
    endDate: { type: mongoose.Schema.Types.Date },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: TaskModel }],
    approver: { type: mongoose.Schema.Types.ObjectId }
}, {
    collection: 'packages',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

PackagesSchema.plugin(uniqueValidator);

const PackagesModel = mongoose.model<IPackage>('PackagesModel', PackagesSchema);
export default PackagesModel;
