import CourseAssignment from '../../model/courseAssignmentModel';
import UserModel from '../../model/userModel';
import CourseModel from '../../model/coursesModel';
import courseProgress from '../../util/manageCourseProgress';
import sendCourseAssignmentEmail from '../../util/sendCourseAssignmentEmail';
import { COURSE_ASSIGNMENT_ERRORS_MESSAGES } from '../../constants/admin/courseAssignmentMessages';

const createCourseAssignment = async (courseId: string, employeeId: string, assignedByAdminId: string, dueDate: Date): Promise< any> => {
    try {
        if(!courseId) {
            throw new Error('Invalid course ID');
        }
        if(!employeeId) {
            throw new Error('Invalid employee ID');
        }

        const existingAssignment = await CourseAssignment.findOne({ courseId, employeeId });

        if (existingAssignment) {
            throw new Error(COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_ALREADY_ASSIGNED_MESSAGE);
        };

        const newCourseAssignment = new CourseAssignment({ courseId, employeeId, assignedByAdminId, status: 'Assigned', assignedAt: new Date(), dueDate, completedAt: null });

        const result = await newCourseAssignment.save();

        // Dispatch the assignment notification email. Failures here must never
        // break the assignment creation or the API response.
        try {
            const [employee, course, modulesByCourse] = await Promise.all([
                UserModel.findById(employeeId).select('firstName lastName email').lean(),
                CourseModel.findById(courseId).select('courseName courseDescription').lean(),
                courseProgress.getActiveModulesByCourse([String(courseId)])
            ]);

            const modules = (modulesByCourse.get(String(courseId)) || []).map((module: any) => ({
                moduleName: module.moduleName,
                moduleDescription: module.moduleDescription
            }));

            let assignedByAdminName: string | undefined;
            if (assignedByAdminId) {
                const admin = await UserModel.findById(assignedByAdminId).select('firstName lastName').lean();
                if (admin) {
                    assignedByAdminName = `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || undefined;
                }
            }

            if (employee && employee.email && course) {
                await sendCourseAssignmentEmail.sendCourseAssignmentEmail({
                    employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || (employee as any).email,
                    employeeEmail: employee.email,
                    courseName: course.courseName,
                    courseDescription: course.courseDescription,
                    modules,
                    dueDate,
                    assignedByAdminName
                });
            }
        } catch (emailError: any) {
            console.error(`Error in sending course assignment email: ${emailError.message}`);
        }

        return result;
    } catch (error: any) {
        console.error(`Error in creating course assignment: ${error.message}`);
        throw error;
    };

};

export default { createCourseAssignment };