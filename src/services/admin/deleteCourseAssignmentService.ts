import mongoose from 'mongoose';
import CourseAssignment from '../../model/courseAssignmentModel';
import { COURSE_ASSIGNMENT_ERRORS_MESSAGES } from '../../constants/admin/courseAssignmentMessages';

const deleteCourseAssignment = async (courseAssignmentId: string): Promise<any> => {
    try {
        if (!courseAssignmentId) {
            throw new Error(COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_ID_INVALID_MESSAGE);
        }

        const deletecourse = await CourseAssignment.findByIdAndDelete(courseAssignmentId);

        if (!deletecourse) {
            throw new Error(COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE);
        }

        return deletecourse;
    } catch (error: any) {
        console.error(`Error in deleting course assignment: ${error.message}`);
        throw error;
    };
};

export default { deleteCourseAssignment };
