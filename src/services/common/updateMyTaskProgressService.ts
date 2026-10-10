import CourseAssignment from '../../model/courseAssignmentModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseTaskModel from '../../model/courseTaskModel';
import TaskProgressModel from '../../model/taskProgressModel';
import courseProgress from '../../util/manageCourseProgress';
import { COURSE_ASSIGNMENT_STATUS } from '../../types/courseAssignmentStatusValues';
import { IUpdateMyTaskProgressResponse } from '../../interfaces/myCourses';
import UserModel from '../../model/userModel';
import CourseModel from '../../model/coursesModel';
import sendCourseCompletionEmail from '../../util/sendCourseCompletionEmail';

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

    const previousStatus = assignment.status;
    const nowCompleted =
        courseStatus === COURSE_ASSIGNMENT_STATUS.COMPLETED &&
        previousStatus !== COURSE_ASSIGNMENT_STATUS.COMPLETED;

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

    if (nowCompleted) {
        console.log(`[CourseCompletion] Transition to Completed detected for assignment ${assignment._id} (employee ${assignment.employeeId}); dispatching admin notification.`);
        void notifyAdminOnCourseCompletion(
            assignment,
            courseStatus === COURSE_ASSIGNMENT_STATUS.COMPLETED
                ? assignment.completedAt || new Date()
                : new Date()
        );
    } else {
        console.log(`[CourseCompletion] No completion transition (status=${courseStatus}, previous=${previousStatus}); no email sent.`);
    }

    return {
        success: true,
        courseStatus,
        progress,
        task: { taskId, isCompleted, completedAt }
    };
};


//  Sends a course-completion notification to the admin who assigned the course

const notifyAdminOnCourseCompletion = async (
    assignment: any,
    completedAt: Date
): Promise<void> => {
    try {
        const [employee, course, admin] = await Promise.all([
            UserModel.findById(assignment.employeeId).lean(),
            CourseModel.findById(assignment.courseId).lean(),
            assignment.assignedByAdminId
                ? UserModel.findById(assignment.assignedByAdminId).lean()
                : null
        ]);

        const adminEmail =
            (admin && (admin as any).email) ||
            process.env.ADMIN_EMAIL_ABOUT_CUSTOMER;

        if (!adminEmail) {
            console.error('[CourseCompletion] No admin email available; skipping notification.');
            return;
        }

        console.log(`[CourseCompletion] Resolved admin recipient: ${adminEmail}`);

        await sendCourseCompletionEmail.sendCourseCompletionEmail({
            adminEmail,
            adminName: admin ? `${(admin as any).firstName || ''} ${(admin as any).lastName || ''}`.trim() : undefined,
            employeeName: employee ? `${(employee as any).firstName || ''} ${(employee as any).lastName || ''}`.trim() : 'Employee',
            courseName: course ? (course as any).courseName : 'Course',
            completedAt
        });
    } catch (error: any) {
        console.error('[CourseCompletion] Failed to notify admin:', error?.message || error);
    }
};

export default { updateMyTaskProgress };
