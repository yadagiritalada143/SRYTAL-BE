import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { IPoolcompanies } from '../interfaces/poolcompanies';
import UserModel from '../model/userModel';

const PoolCompaniesSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    companyName: { type: mongoose.Schema.Types.String, required: true, unique: true },
    primaryContact: {
        name: { type: mongoose.Schema.Types.String },
        email: { type: mongoose.Schema.Types.String },
        phone: { type: mongoose.Schema.Types.String }
    },
    secondaryContact_1: {
        name: { type: mongoose.Schema.Types.String },
        email: { type: mongoose.Schema.Types.String },
        phone: { type: mongoose.Schema.Types.String }
    },
    secondaryContact_2: {
        name: { type: mongoose.Schema.Types.String },
        email: { type: mongoose.Schema.Types.String },
        phone: { type: mongoose.Schema.Types.String }
    },
    status: { type: mongoose.Schema.Types.String },
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: UserModel },
        comment: { type: mongoose.Schema.Types.String },
        updateAt: { type: mongoose.Schema.Types.Date }
    }],
    createdAt: { type: mongoose.Schema.Types.Date },
    lastUpdatedAt: { type: mongoose.Schema.Types.Date },
     isDeleted: { type: mongoose.Schema.Types.Boolean },
}, {
    collection: 'pool-companies',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

PoolCompaniesSchema.plugin(uniqueValidator);

const PoolCompaniesModel = mongoose.model<IPoolcompanies>('PoolCompaniesSchema', PoolCompaniesSchema);
export default PoolCompaniesModel;
