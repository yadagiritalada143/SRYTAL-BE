import CourseAssignment from '../../model/courseAssignmentModel';
import UserModel from '../../model/userModel';
import CourseModel from '../../model/coursesModel';
import sendCourseDueDateUpdateEmail from '../../util/sendCourseDueDateUpdateEmail';
import { COURSE_ASSIGNMENT_ERRORS_MESSAGES } from '../../constants/admin/courseAssignmentMessages';


const updateCourseAssignmentDueDate = async (
    id: string,
    dueDate: Date
): Promise<any> => {
    try {
        if (!dueDate) {
            throw new Error('Invalid due date');
        }

        const assignment = await CourseAssignment.findById(id);

        if (!assignment) {
            throw new Error(COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE);
        }

        const oldDueDate = assignment.dueDate;

        assignment.dueDate = dueDate;
        const result = await assignment.save();

        // Dispatch the due date update notification email. Failures here must never
        // break the due date update or the API response.
        try {
            const [employee, course] = await Promise.all([
                UserModel.findById(assignment.employeeId).select('firstName lastName email').lean(),
                CourseModel.findById(assignment.courseId).select('courseName').lean()
            ]);

            if (employee && employee.email && course) {
                const isExtended = new Date(dueDate) > new Date(oldDueDate);
                await sendCourseDueDateUpdateEmail.sendCourseDueDateUpdateEmail({
                    employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || (employee as any).email,
                    employeeEmail: employee.email,
                    courseName: course.courseName,
                    oldDueDate,
                    newDueDate: dueDate,
                    isExtended
                });
            }
        } catch (emailError: any) {
            console.error(`Error in sending course due date update email: ${emailError.message}`);
        }

        return result;
    } catch (error: any) {
        console.error(`Error in updating course assignment due date: ${error.message}`);
        throw error;
    }
};


export default { updateCourseAssignmentDueDate };
