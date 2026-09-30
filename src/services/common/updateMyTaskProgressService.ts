import CourseAssignment from '../../model/courseAssignmentModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseTaskModel from '../../model/courseTaskModel';
import TaskProgressModel from '../../model/taskProgressModel';
import { refreshAssignmentCompletion } from '../../util/syncTaskCompletion';
import { IUpdateMyTaskProgressResponse } from '../../interfaces/myCourses';

/**
 * Marks a single non-coding task of an assigned course complete/incomplete for
 * the logged-in employee, then re-derives the assignment status from the
 * resulting counts (Assigned -> In Progress -> Completed) so the two can never
 * disagree.
 *
 * A coding task is rejected: its questions are graded one by one and the task
 * becomes complete on its own once every active question has a passing
 * submission (see util/syncTaskCompletion). Letting the client tick it would let
 * an employee skip every question.
 */
const updateMyTaskProgress = async (
    courseAssignmentId: string,
    taskId: string,
    isCompleted: boolean,
    employeeId: string
): Promise<IUpdateMyTaskProgressResponse> => {
    // Scoping by employeeId is what stops one employee writing progress onto
    // another employee's assignment.
    const assignment: any = await CourseAssignment.findOne({ _id: courseAssignmentId, employeeId }).lean();

    if (!assignment) {
        return { success: false, notFound: true };
    }

    const task: any = await CourseTaskModel.findById(taskId).lean();

    if (!task) {
        return { success: false, invalidTask: true };
    }

    if (task.isCoding) {
        return { success: false, isCodingTask: true };
    }

    // The task must live under a module of the assigned course, otherwise an
    // employee could tick off tasks from a course they were never assigned.
    const parentModule: any = await CourseModuleModel.findById(task.moduleId).lean();

    if (!parentModule || String(parentModule.courseId) !== String(assignment.courseId)) {
        return { success: false, invalidTask: true };
    }

    const completedAt = isCompleted ? new Date() : null;

    await TaskProgressModel.findOneAndUpdate(
        { courseAssignmentId, moduleId: parentModule._id, taskId },
        { $set: { isCompleted, completedAt } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const { courseStatus, progress } = await refreshAssignmentCompletion(assignment);

    return {
        success: true,
        courseStatus,
        progress,
        task: { taskId, isCompleted, completedAt }
    };
};

export default { updateMyTaskProgress };

