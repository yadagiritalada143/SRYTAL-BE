import { Request, Response } from "express";
import deleteCourseAssignmentService from '../../services/admin/deleteCourseAssignmentService';
import { COURSE_ASSIGNMENT_SUCCESS_MESSAGES, COURSE_ASSIGNMENT_ERRORS_MESSAGES } from '../../constants/admin/courseAssignmentMessages';

const deleteCourseAssignment = async (req: Request, res: Response) => {
    try {

        const { courseAssignmentId } = req.params;

        if (!courseAssignmentId) {
            return res.status(400).json({
                success: false,
                message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_ID_INVALID_MESSAGE,
            });
        }

        await deleteCourseAssignmentService.deleteCourseAssignment(courseAssignmentId);

        return res.status(200).json({
            success: true,
            message: COURSE_ASSIGNMENT_SUCCESS_MESSAGES.COURSE_ASSIGNMENT_DELETE_SUCCESS_MESSAGE
        });
    } catch (error: any) {
        console.error(`Error in deleting course assignment: ${error.message}`);

        if (error.message === COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE) {
            return res.status(404).json({
                success: false,
                message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE,
            });
        }

        return res.status(400).json({
            success: false,
            message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DELETE_ERROR_MESSAGE,
        });
    };
};

export default { deleteCourseAssignment };
