import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import {IEmployeePackage} from '../interfaces/employeepackages';
import UserModel from './userModel';
import PackagesModel from './packageModel';
import TaskModel from './taskModel';

const EmployeePackagesSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: UserModel },
    packages:[{ 
        packageId:{ type: mongoose.Schema.Types.ObjectId, ref:PackagesModel},
        tasks:[{
            taskId:{ type: mongoose.Schema.Types.ObjectId, ref:TaskModel },
            startDate: { type: mongoose.Schema.Types.Date },
            createdAt: { type: mongoose.Schema.Types.Date },
            currentMonthLastDay: {type: mongoose.Schema.Types.String},
        }]
    }]
    
}, {
    collection: 'employee-packages',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

EmployeePackagesSchema.plugin(uniqueValidator);

const EmployeePackageModel = mongoose.model<IEmployeePackage>('EmployeePackageModel', EmployeePackagesSchema);

export default EmployeePackageModel;
