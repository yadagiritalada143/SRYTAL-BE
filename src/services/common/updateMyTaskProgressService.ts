import CourseAssignment from '../../model/courseAssignmentModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseTaskModel from '../../model/courseTaskModel';
import TaskProgressModel from '../../model/taskProgressModel';
import courseProgress from '../../util/manageCourseProgress';
import { COURSE_ASSIGNMENT_STATUS } from '../../types/courseAssignmentStatusValues';
import { IUpdateMyTaskProgressResponse } from '../../interfaces/myCourses';

/**
 * Marks a single task of an assigned course complete/incomplete for the logged-in
 * employee, then re-derives the assignment status from the resulting counts
 * (Assigned -> In Progress -> Completed) so the two can never disagree.
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

    const [modulesByCourse, completedByAssignment] = await Promise.all([
        courseProgress.getActiveModulesByCourse([String(assignment.courseId)]),
        courseProgress.getCompletedTaskIds([String(assignment._id)])
    ]);

    const courseModules = modulesByCourse.get(String(assignment.courseId)) || [];
    const tasksByModule = await courseProgress.getActiveTasksByModule(
        courseModules.map((module: any) => String(module._id))
    );

    const modules = courseProgress.buildCourseModules(
        courseModules,
        tasksByModule,
        completedByAssignment.get(String(assignment._id)) || new Map()
    );
    const progress = courseProgress.summariseProgress(modules);
    const courseStatus = courseProgress.deriveAssignmentStatus(
        progress.completedTasks,
        progress.totalTasks
    );

    await CourseAssignment.updateOne(
        { _id: assignment._id },
        {
            $set: {
                status: courseStatus,
                completedAt:
                    courseStatus === COURSE_ASSIGNMENT_STATUS.COMPLETED
                        ? assignment.completedAt || new Date()
                        : null
            }
        }
    );

    return {
        success: true,
        courseStatus,
        progress,
        task: { taskId, isCompleted, completedAt }
    };
};

export default { updateMyTaskProgress };
