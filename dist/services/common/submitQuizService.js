"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const courseAssignmentModel_1 = __importDefault(require("../../model/courseAssignmentModel"));
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const taskProgressModel_1 = __importDefault(require("../../model/taskProgressModel"));
const quizConfig_1 = __importDefault(require("../../config/quizConfig"));
const updateMyTaskProgressService_1 = __importDefault(require("./updateMyTaskProgressService"));
/**
 * Re-derives the authoritative score from the attempt snapshot written by
 * validateQuiz. The client never supplies a score, and the stored counts are
 * server-written, so recomputing percentage/passed here (rather than trusting a
 * stored percentage) keeps the finalized result internally consistent and bound
 * to the currently configured passing threshold. Zero scored questions is a
 * defined unscored result (null percentage/passed), never NaN.
 */
const deriveResult = (attempt, passingPercentage) => {
    var _a, _b;
    const totalScoredQuestions = Number((_a = attempt.totalScoredQuestions) !== null && _a !== void 0 ? _a : 0);
    const correctAnswers = Number((_b = attempt.correctAnswers) !== null && _b !== void 0 ? _b : 0);
    const percentage = totalScoredQuestions > 0
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
/**
 * Finalizes a validated quiz attempt and records the result on the employee's
 * existing task-progress row. The flow:
 *
 *  1. Scope the request to the authenticated employee's assignment and their own
 *     attempt on that task's progress row, so an attempt can only be submitted by
 *     the employee who started it.
 *  2. Require a trusted, successful validation snapshot (validateQuiz must run
 *     first). The score is re-derived from that snapshot — the client never sends
 *     a score.
 *  3. A failed score is not eligible for finalization: the score is returned and
 *     the employee must start a new attempt. Nothing is marked complete.
 *  4. A passing (or unscored) attempt is claimed atomically by setting
 *     `submittedAt` only while it is still null. This is the idempotency guard:
 *     only the winning call advances the course, so duplicate submissions can
 *     never create duplicate progress or double-complete the course. A repeat of
 *     an already-finalized submission is a no-op that returns the stored result.
 *  5. Completion reuses updateMyTaskProgress, so the task is marked complete, the
 *     assignment status is re-derived, and the next task's progression (derived
 *     from completed counts) updates exactly as a normal task completion would.
 *
 * Previous attempts and any existing completion state are preserved: only the
 * single (assignment, module, task) progress row is touched, and the attempt
 * list is never rewritten.
 */
const submitQuiz = async (taskId, attemptId, employeeId) => {
    var _a, _b, _c, _d, _e, _f;
    if (!taskId || !mongoose_1.Types.ObjectId.isValid(taskId)) {
        return { success: false, invalidTaskId: true };
    }
    if (!attemptId || !mongoose_1.Types.ObjectId.isValid(attemptId)) {
        return { success: false, invalidAttemptId: true };
    }
    try {
        const task = await courseTaskModel_1.default.findById(taskId)
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
        const parentModule = await coursemoduleModel_1.default.findById(task.moduleId)
            .select('courseId')
            .lean();
        if (!parentModule || !parentModule.courseId) {
            return { success: false, notFound: true };
        }
        const assignment = await courseAssignmentModel_1.default.findOne({
            courseId: parentModule.courseId,
            employeeId
        }).lean();
        if (!assignment) {
            return { success: false, notFound: true };
        }
        // The attempt must live on THIS employee's progress row for THIS task.
        const progress = await taskProgressModel_1.default.findOne({
            courseAssignmentId: assignment._id,
            moduleId: parentModule._id,
            taskId
        })
            .select('quizAttempts isCompleted completedAt')
            .lean();
        const attempt = ((progress === null || progress === void 0 ? void 0 : progress.quizAttempts) || []).find((entry) => String(entry._id) === String(attemptId));
        if (!attempt) {
            return { success: false, attemptNotFound: true };
        }
        const passingPercentage = quizConfig_1.default.getQuizPassingPercentage();
        const result = deriveResult(attempt, passingPercentage);
        // Already finalized: idempotent success, no state change. The task is
        // reported completed straight from the progress row.
        if (attempt.submittedAt) {
            return Object.assign(Object.assign({ success: true, alreadySubmitted: true, taskId,
                attemptId, attemptNumber: attempt.attemptNumber }, result), { reattemptRequired: false, isCompleted: (progress === null || progress === void 0 ? void 0 : progress.isCompleted) === true, completedAt: (_a = progress === null || progress === void 0 ? void 0 : progress.completedAt) !== null && _a !== void 0 ? _a : null });
        }
        // No trusted score yet — validateQuiz must run first. A partially
        // written snapshot is treated the same as an unvalidated attempt.
        if (!attempt.validatedAt ||
            attempt.totalScoredQuestions === null ||
            attempt.totalScoredQuestions === undefined ||
            attempt.correctAnswers === null ||
            attempt.correctAnswers === undefined) {
            return { success: false, attemptNotValidated: true };
        }
        // A failed score cannot be finalized. Return the score so the client can
        // show it, and require a fresh attempt. Nothing is written.
        if (result.passed === false) {
            return Object.assign(Object.assign({ success: false, notPassed: true, taskId,
                attemptId, attemptNumber: attempt.attemptNumber }, result), { reattemptRequired: true });
        }
        // Claim the attempt for finalization. A filtered positional update
        // (`$[attempt]`) targets the exact element by _id while still requiring
        // submittedAt to be null; the plain `$` operator is ambiguous with
        // multiple conditions on the same array and could stamp the wrong
        // attempt. Only the call that flips submittedAt from null advances the
        // course, so concurrent or repeated submissions cannot double-complete it.
        const now = new Date();
        const claim = await taskProgressModel_1.default.updateOne({ _id: progress._id }, { $set: { 'quizAttempts.$[attempt].submittedAt': now } }, {
            arrayFilters: [
                { 'attempt._id': attemptId, 'attempt.submittedAt': null }
            ]
        });
        // Nothing modified => lost the race (or an earlier call already finalized
        // it): behave as an idempotent success without touching completion again.
        if (!claim || claim.modifiedCount === 0) {
            return Object.assign(Object.assign({ success: true, alreadySubmitted: true, taskId,
                attemptId, attemptNumber: attempt.attemptNumber }, result), { reattemptRequired: false, isCompleted: (progress === null || progress === void 0 ? void 0 : progress.isCompleted) === true, completedAt: (_b = progress === null || progress === void 0 ? void 0 : progress.completedAt) !== null && _b !== void 0 ? _b : null });
        }
        // Mark the task complete and advance the course through the same routine
        // a normal task completion uses. This preserves the attempt history and
        // only re-derives counts/status from the task-progress rows.
        const completion = await updateMyTaskProgressService_1.default.updateMyTaskProgress(String(assignment._id), taskId, true, employeeId);
        if (!completion.success) {
            // The attempt is claimed, so a retry resolves idempotently; report a
            // generic failure for this call rather than claiming a bad success.
            return { success: false };
        }
        return Object.assign(Object.assign({ success: true, taskId,
            attemptId, attemptNumber: attempt.attemptNumber }, result), { reattemptRequired: false, courseStatus: completion.courseStatus, progress: completion.progress, isCompleted: (_d = (_c = completion.task) === null || _c === void 0 ? void 0 : _c.isCompleted) !== null && _d !== void 0 ? _d : true, completedAt: (_f = (_e = completion.task) === null || _e === void 0 ? void 0 : _e.completedAt) !== null && _f !== void 0 ? _f : null });
    }
    catch (error) {
        console.error(`Error in submitting quiz for task ${taskId}: ${error}`);
        return { success: false };
    }
};
exports.default = { submitQuiz };
