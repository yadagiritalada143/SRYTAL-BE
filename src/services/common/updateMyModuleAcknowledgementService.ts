import CourseAssignment from '../../model/courseAssignmentModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import { IUpdateMyModuleAcknowledgementResponse } from '../../interfaces/myCourses';

/**
 * Records the authenticated employee's acknowledgement for one module of one
 * assigned course. The record lives on the CourseAssignment document, which is
 * already unique per (courseId, employeeId), so it is naturally scoped to the
 * employee, the assignment and the module without a separate collection.
 *
 * Acknowledging with `false` is rejected: acknowledgement records are immutable
 * once confirmed. Retrying with `true` must not create a duplicate or reset the
 * original acknowledgedAt, so the write is a guarded `$push` whose filter only
 * matches when the module has no acknowledgement record yet — the update is
 * atomic on the single assignment document.
 */
const updateMyModuleAcknowledgement = async (
    courseAssignmentId: string,
    moduleId: string,
    acknowledged: boolean,
    employeeId: string
): Promise<IUpdateMyModuleAcknowledgementResponse> => {
    const assignment: any = await CourseAssignment.findOne({ _id: courseAssignmentId, employeeId }).lean();

    if (!assignment) {
        return { success: false, notFound: true };
    }

    const module: any = await CourseModuleModel.findById(moduleId).lean();

    if (!module || String(module.courseId) !== String(assignment.courseId)) {
        return { success: false, invalidModule: true };
    }

    if (acknowledged !== true) {
        return { success: false, revocationNotAllowed: true };
    }

    const acknowledgedAt = new Date();

    // Insert only when this module is not acknowledged yet. On a retry the
    // filter matches nothing, so no duplicate is added and the original
    // acknowledgedAt is left untouched.
    await CourseAssignment.updateOne(
        { _id: assignment._id, employeeId: assignment.employeeId, 'moduleAcknowledgements.moduleId': { $ne: moduleId } },
        { $push: { moduleAcknowledgements: { moduleId, acknowledged: true, acknowledgedAt } } }
    );

    const refreshed: any = await CourseAssignment.findById(assignment._id).lean();
    const record = (refreshed?.moduleAcknowledgements || []).find(
        (entry: any) => String(entry.moduleId) === String(moduleId)
    );

    return {
        success: true,
        courseAssignmentId,
        moduleId,
        acknowledged: true,
        acknowledgedAt: record?.acknowledgedAt || acknowledgedAt
    };
};

export default { updateMyModuleAcknowledgement };