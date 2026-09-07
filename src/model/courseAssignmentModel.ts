import mongoose, { Schema, Document } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import {ICourseAssignment} from '../interfaces/courseAssignment';

const CourseAssignmentSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseModel', required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'userModel', required: true, index: true },
    assignedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'userModel', required: true },
    status: {  type: String, enum: ['Assigned', 'In Progress', 'Completed'], default: 'Assigned',required: true },
    assignedAt: { type: Date, default: Date.now, required: true },
    dueDate: { type: Date,  default: Date.now, required: true },
    completedAt: { type: Date, default: null },
    lastReminderSentAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
},

{
    collection: 'course-assignments',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

CourseAssignmentSchema.index(
    {
        courseId: 1,
        employeeId: 1,
    },
    {
        unique: true,
    }
);

CourseAssignmentSchema.plugin(uniqueValidator);

const CourseAssignment = mongoose.model<ICourseAssignment>('CourseAssignment', CourseAssignmentSchema);

export default CourseAssignment;
