import mongoose, { Document } from 'mongoose';

export interface IQuizAttempt {
    _id: mongoose.Schema.Types.ObjectId;
    attemptNumber: number;
    startedAt?: Date;
}

export interface ITaskProgress extends Document {
    courseAssignmentId:mongoose.Schema.Types.ObjectId;
    moduleId: mongoose.Schema.Types.ObjectId;
    taskId: mongoose.Schema.Types.ObjectId;
    isCompleted: boolean;
    completedAt?: Date | null;
    // Quiz attempt history. The subdocument _id doubles as the attemptId that
    // the employee-facing quiz endpoints return and later validate against.
    quizAttempts?: IQuizAttempt[];
    createdAt: Date;
    updatedAt: Date;
}