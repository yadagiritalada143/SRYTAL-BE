import mongoose, { Document } from 'mongoose';

export interface IQuizAttempt {
    _id: mongoose.Schema.Types.ObjectId;
    attemptNumber: number;
    startedAt?: Date;
    // Score snapshot written by validateQuiz. A null validatedAt means the
    // attempt has not been checked yet; submittedAt (set later by submitQuiz)
    // finalizes the attempt and blocks any further validation.
    validatedAt?: Date | null;
    totalScoredQuestions?: number | null;
    correctAnswers?: number | null;
    percentage?: number | null;
    passed?: boolean | null;
    submittedAt?: Date | null;
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