import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { ITaskProgress } from '../interfaces/taskProgress';

const TaskProgressSchema = new mongoose.Schema(
    {
        courseAssignmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CourseAssignment',
            required: true,
            index: true,
        },

        moduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CourseModule',
            required: true,
            index: true,
        },

        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CourseTask',
            required: true,
            index: true,
        },

        isCompleted: {
            type: Boolean,
            default: false,
            required: true,
        },

        completedAt: {
            type: Date,
            default: null,
        },
    },
    {
        collection: 'task-progress',
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
);

TaskProgressSchema.index(
    {
        courseAssignmentId: 1,
        moduleId: 1,
        taskId: 1,
    },
    {
        unique: true,
    }
);

TaskProgressSchema.plugin(uniqueValidator);

const TaskProgressModel = mongoose.model<ITaskProgress>('TaskProgress', TaskProgressSchema);

export default TaskProgressModel;