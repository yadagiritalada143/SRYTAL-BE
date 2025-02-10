import mongoose, { Schema } from 'mongoose';
import IEmployeerole from '../interfaces/employeerole'

const EmployeeroleSchema: Schema = new mongoose.Schema({
    designation: { type: mongoose.Schema.Types.String, required: true },
}, {
    collection: 'employee-role',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

const Employeerole = mongoose.model<IEmployeerole>('EmployeeroleSchema', EmployeeroleSchema);
export default Employeerole;