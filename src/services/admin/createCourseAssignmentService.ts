import CourseAssignment from '../../model/courseAssignmentModel';
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

        return result;
    } catch (error: any) {
        console.error(`Error in creating course assignment:@{error.message}`);
        throw error;
    };

};

export default { createCourseAssignment };