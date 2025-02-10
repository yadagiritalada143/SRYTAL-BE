import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import IEmploymenttype from '../interfaces/employmenttype';

const EmploymenttypeSchema: Schema = new mongoose.Schema({
    employmentType: { type: mongoose.Schema.Types.String, required: true , unique: true },
}, {
    collection: 'employment-type',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

EmploymenttypeSchema.plugin(uniqueValidator);

const Employmenttype = mongoose.model<IEmploymenttype>('', EmploymenttypeSchema);
export default Employmenttype;
