import UserModel from '../model/userModel';
import CourseModel from '../model/coursesModel';
import sendCourseCompletionEmail from './sendCourseCompletionEmail';

/**
 * Sends the course-completion notification to the admin who assigned the course.
 * Shared by every path that can complete a course - the employee ticking off a
 * non-coding task and the server deriving the completion of a coding task from a
 * passing submission - so the "who gets told what" rule lives in one place.
 */
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

        const adminEmail = (admin as any)?.email || process.env.ADMIN_EMAIL_ABOUT_CUSTOMER;

        if (!adminEmail) {
            console.error('[CourseCompletion] No admin email available; skipping notification.');
            return;
        }

        console.log(`[CourseCompletion] Resolved admin recipient: ${adminEmail}`);
        console.log(`[CourseCompletion] Email for assignment ${assignment._id} (employee ${assignment.employeeId}); dispatching admin notification.`);

        await sendCourseCompletionEmail.sendCourseCompletionEmail({
            adminEmail,
            adminName: admin
                ? `${(admin as any).firstName || ''} ${(admin as any).lastName || ''}`.trim()
                : undefined,
            employeeName: employee
                ? `${(employee as any).firstName || ''} ${(employee as any).lastName || ''}`.trim()
                : 'Employee',
            courseName: course ? (course as any).courseName : 'Course',
            completedAt
        });
    } catch (error: any) {
        console.error('[CourseCompletion] Failed to notify admin:', error?.message || error);
    }
};

export default { notifyAdminOnCourseCompletion };
