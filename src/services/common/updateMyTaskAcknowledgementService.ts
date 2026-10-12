import CourseAssignment from '../../model/courseAssignmentModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseTaskModel from '../../model/courseTaskModel';
import { IUpdateMyTaskAcknowledgementResponse } from '../../interfaces/myCourses';

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
const updateMyTaskAcknowledgement = async (
    courseAssignmentId: string,
    taskId: string,
    acknowledged: boolean,
    employeeId: string
): Promise<IUpdateMyTaskAcknowledgementResponse> => {
    const assignment: any = await CourseAssignment.findOne({ _id: courseAssignmentId, employeeId }).lean();

    if (!assignment) {
        return { success: false, notFound: true };
    }

    const task: any = await CourseTaskModel.findById(taskId).lean();

    if (!task) {
        return { success: false, invalidTask: true };
    }

    // The task must live under a module of the assigned course, otherwise an
    // employee could acknowledge tasks from a course they were never assigned.
    const parentModule: any = await CourseModuleModel.findById(task.moduleId).lean();

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
    await CourseAssignment.updateOne(
        { _id: assignment._id, employeeId: assignment.employeeId, 'taskAcknowledgements.taskId': { $ne: taskId } },
        { $push: { taskAcknowledgements: { taskId, acknowledged: true, acknowledgedAt } } }
    );

    const refreshed: any = await CourseAssignment.findById(assignment._id).lean();
    const record = (refreshed?.taskAcknowledgements || []).find(
        (entry: any) => String(entry.taskId) === String(taskId)
    );

    return {
        success: true,
        courseAssignmentId,
        taskId,
        acknowledged: true,
        acknowledgedAt: record?.acknowledgedAt || acknowledgedAt
    };
};

export default { updateMyTaskAcknowledgement };