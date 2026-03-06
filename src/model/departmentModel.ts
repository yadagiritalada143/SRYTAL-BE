import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import IDepartment from '../interfaces/department';

const DepartmentSchema: Schema = new mongoose.Schema({
    departmentName: { type: mongoose.Schema.Types.String, required: true , unique: true },
}, {
    collection: 'department',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

DepartmentSchema.plugin(uniqueValidator);

const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);

export default Department;
