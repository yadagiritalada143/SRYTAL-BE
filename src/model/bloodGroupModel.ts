import mongoose, { Schema } from 'mongoose';
import IBloodgroup from '../interfaces/bloodgroup';

const BloodgroupSchema: Schema = new mongoose.Schema({
    type: { type: mongoose.Schema.Types.String, required: true },
}, {
    collection: 'blood-group',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

const BloodgroupModel = mongoose.model<IBloodgroup>('BloodgroupSchema', BloodgroupSchema);
export default BloodgroupModel;