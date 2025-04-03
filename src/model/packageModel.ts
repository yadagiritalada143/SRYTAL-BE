import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import UserModel from '../model/userModel';
import { IPackage } from '../interfaces/package';

const PackagesSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    title: { type: mongoose.Schema.Types.String, required: true, unique: true },
    description: { type: mongoose.Schema.Types.String },
    startDate: { type: mongoose.Schema.Types.Date },
    endDate: { type: mongoose.Schema.Types.Date },
    approvers: [{ type: mongoose.Schema.Types.ObjectId, ref: UserModel }],
    isDeleted: { type: mongoose.Schema.Types.Boolean },
},
 {
    collection: 'packages',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

PackagesSchema.plugin(uniqueValidator);

const PackagesModel = mongoose.model<IPackage>('PackagesModel', PackagesSchema);
export default PackagesModel;
