import mongoose from 'mongoose';
import { ILeave } from '../interfaces/leave';

const LeaveSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'userModel', required: true, index: true },
    leaveType: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    numberOfDays: { type: Number, required: true },
    reason: { type: String },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', required: true },
    rejectionReason: { type: String },
    notificationEmailSent: { type: Boolean, default: false },
    employeeNotificationEmailSent: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
},
{
    collection: 'leaves',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

const LeaveModel = mongoose.model<ILeave>('Leave', LeaveSchema);

export default LeaveModel;
