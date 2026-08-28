import CourseAssignment from '../../model/courseAssignmentModel';
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

        assignment.dueDate = dueDate;
        const result = await assignment.save();

        return result;
    } catch (error: any) {
        console.error(`Error in updating course assignment due date: ${error.message}`);
        throw error;
    }
};


export default { updateCourseAssignmentDueDate };
