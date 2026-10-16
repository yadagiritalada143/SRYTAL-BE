import { Types } from 'mongoose';
import CourseAssignment from '../../model/courseAssignmentModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseTaskModel from '../../model/courseTaskModel';
import TaskProgressModel from '../../model/taskProgressModel';
import quizConfig from '../../config/quizConfig';
import updateMyTaskProgressService from './updateMyTaskProgressService';
import { ISubmitQuizResponse } from '../../interfaces/myCourses';

const deriveResult = (attempt: any, passingPercentage: number): {
    totalScoredQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    percentage: number | null;
    passingPercentage: number;
    passed: boolean | null;
} => {
    const totalScoredQuestions = Number(attempt.totalScoredQuestions ?? 0);
    const correctAnswers = Number(attempt.correctAnswers ?? 0);
    const percentage =
        totalScoredQuestions > 0
            ? Math.round((correctAnswers / totalScoredQuestions) * 100)
            : null;
    const passed = percentage === null ? null : percentage >= passingPercentage;

    return {
        totalScoredQuestions,
        correctAnswers,
        incorrectAnswers: totalScoredQuestions - correctAnswers,
        percentage,
        passingPercentage,
        passed
    };
};

const submitQuiz = async ( taskId: string, attemptId: string, employeeId: string): Promise<ISubmitQuizResponse> => {
    if (!taskId || !Types.ObjectId.isValid(taskId)) {
        return { success: false, invalidTaskId: true };
    }

    if (!attemptId || !Types.ObjectId.isValid(attemptId)) {
        return { success: false, invalidAttemptId: true };
    }

    try {
        const task: any = await CourseTaskModel.findById(taskId)
            .select('moduleId type status')
            .lean();

        if (!task) {
            return { success: false, taskNotFound: true };
        }

        if (String(task.type || '').toUpperCase() !== 'QUIZ') {
            return { success: false, notQuizTask: true };
        }

        if (String(task.status || '').toUpperCase() !== 'ACTIVE') {
            return { success: false, taskInactive: true };
        }

        const parentModule: any = await CourseModuleModel.findById(task.moduleId)
            .select('courseId')
            .lean();

        if (!parentModule || !parentModule.courseId) {
            return { success: false, notFound: true };
        }

        const assignment: any = await CourseAssignment.findOne({
            courseId: parentModule.courseId,
            employeeId
        }).lean();

        if (!assignment) {
            return { success: false, notFound: true };
        }

        const progress: any = await TaskProgressModel.findOne({
            courseAssignmentId: assignment._id,
            moduleId: parentModule._id,
            taskId
        })
            .select('quizAttempts isCompleted completedAt')
            .lean();

        const attempt = (progress?.quizAttempts || []).find(
            (entry: any) => String(entry._id) === String(attemptId)
        );

        if (!attempt) {
            return { success: false, attemptNotFound: true };
        }

        const passingPercentage = quizConfig.getQuizPassingPercentage();
        const result = deriveResult(attempt, passingPercentage);

        if (attempt.submittedAt) {
            return {
                success: true,
                alreadySubmitted: true,
                taskId,
                attemptId,
                attemptNumber: attempt.attemptNumber,
                ...result,
                reattemptRequired: false,
                isCompleted: progress?.isCompleted === true,
                completedAt: progress?.completedAt ?? null
            };
        }

        if (
            !attempt.validatedAt ||
            attempt.totalScoredQuestions === null ||
            attempt.totalScoredQuestions === undefined ||
            attempt.correctAnswers === null ||
            attempt.correctAnswers === undefined
        ) {
            return { success: false, attemptNotValidated: true };
        }

        if (result.passed === false) {
            return {
                success: false,
                notPassed: true,
                taskId,
                attemptId,
                attemptNumber: attempt.attemptNumber,
                ...result,
                reattemptRequired: true
            };
        }

        const now = new Date();
        const claim = await TaskProgressModel.updateOne(
            { _id: progress._id },
            { $set: { 'quizAttempts.$[attempt].submittedAt': now } },
            {
                arrayFilters: [
                    { 'attempt._id': attemptId, 'attempt.submittedAt': null }
                ]
            }
        );

        if (!claim || claim.modifiedCount === 0) {
            return {
                success: true,
                alreadySubmitted: true,
                taskId,
                attemptId,
                attemptNumber: attempt.attemptNumber,
                ...result,
                reattemptRequired: false,
                isCompleted: progress?.isCompleted === true,
                completedAt: progress?.completedAt ?? null
            };
        }

        const completion = await updateMyTaskProgressService.updateMyTaskProgress(String(assignment._id), taskId, true, employeeId);

        if (!completion.success) {
            return { success: false };
        }

        return {
            success: true,
            taskId,
            attemptId,
            attemptNumber: attempt.attemptNumber,
            ...result,
            reattemptRequired: false,
            courseStatus: completion.courseStatus,
            progress: completion.progress,
            isCompleted: completion.task?.isCompleted ?? true,
            completedAt: completion.task?.completedAt ?? null
        };
    } catch (error: any) {
        console.error(`Error in submitting quiz for task ${taskId}: ${error}`);
        return { success: false };
    }
};

export default { submitQuiz };
