import CourseAssignment from '../../model/courseAssignmentModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseTaskModel from '../../model/courseTaskModel';
import { IUpdateMyTaskAcknowledgementResponse } from '../../interfaces/myCourses';

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
