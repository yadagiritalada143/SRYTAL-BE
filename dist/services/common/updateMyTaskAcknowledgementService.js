"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseAssignmentModel_1 = __importDefault(require("../../model/courseAssignmentModel"));
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
/**
 * Records the authenticated employee's acknowledgement for one task of one
 * assigned course. The record lives on the CourseAssignment document, which is
 * already unique per (courseId, employeeId), so it is naturally scoped to the
 * employee, the assignment and the task without a separate collection.
 *
 * Acknowledgement only applies to FILE tasks: LINK and CODE tasks are rejected
 * with `notFileTask`. Acknowledging with `false` is rejected: acknowledgement
 * records are immutable once confirmed. Retrying with `true` must not create a
 * duplicate or reset the original acknowledgedAt, so the write is a guarded
 * `$push` whose filter only matches when the task has no acknowledgement record
 * yet — the update is atomic on the single assignment document.
 */
const updateMyTaskAcknowledgement = async (courseAssignmentId, taskId, acknowledged, employeeId) => {
    const assignment = await courseAssignmentModel_1.default.findOne({ _id: courseAssignmentId, employeeId }).lean();
    if (!assignment) {
        return { success: false, notFound: true };
    }
    const task = await courseTaskModel_1.default.findById(taskId).lean();
    if (!task) {
        return { success: false, invalidTask: true };
    }
    // The task must live under a module of the assigned course, otherwise an
    // employee could acknowledge tasks from a course they were never assigned.
    const parentModule = await coursemoduleModel_1.default.findById(task.moduleId).lean();
    if (!parentModule || String(parentModule.courseId) !== String(assignment.courseId)) {
        return { success: false, invalidTask: true };
    }
    if (String(task.type || '').toUpperCase() !== 'FILE') {
        return { success: false, notFileTask: true };
    }
    if (acknowledged !== true) {
        return { success: false, revocationNotAllowed: true };
    }
    const acknowledgedAt = new Date();
    // Insert only when this task is not acknowledged yet. On a retry the
    // filter matches nothing, so no duplicate is added and the original
    // acknowledgedAt is left untouched.
    await courseAssignmentModel_1.default.updateOne({ _id: assignment._id, employeeId: assignment.employeeId, 'taskAcknowledgements.taskId': { $ne: taskId } }, { $push: { taskAcknowledgements: { taskId, acknowledged: true, acknowledgedAt } } });
    const refreshed = await courseAssignmentModel_1.default.findById(assignment._id).lean();
    const record = ((refreshed === null || refreshed === void 0 ? void 0 : refreshed.taskAcknowledgements) || []).find((entry) => String(entry.taskId) === String(taskId));
    return {
        success: true,
        courseAssignmentId,
        taskId,
        acknowledged: true,
        acknowledgedAt: (record === null || record === void 0 ? void 0 : record.acknowledgedAt) || acknowledgedAt
    };
};
exports.default = { updateMyTaskAcknowledgement };
