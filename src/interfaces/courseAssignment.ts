import mongoose, { Document } from 'mongoose';
import CourseAssignmentStatus from '../types/courseAssignment';

export interface ICourseAssignment  extends Document {
    courseId: mongoose.Schema.Types.ObjectId;
    employeeId: mongoose.Schema.Types.ObjectId;
    assignedByAdminId: mongoose.Schema.Types.ObjectId;
    status: CourseAssignmentStatus;
    assignedAt: Date;
    dueDate: Date;
    completedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
};
