import { Request, Response } from "express";
import getAllCourseAssignmentsService from '../../services/admin/getAllCourseAssignmentsService';
import { COURSE_ASSIGNMENT_SUCCESS_MESSAGES, COURSE_ASSIGNMENT_ERRORS_MESSAGES } from '../../constants/admin/courseAssignmentMessages';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';

const getAllCourseAssignments = async (req: Request, res: Response) => {
    try {
        const assignments = await getAllCourseAssignmentsService.getAllCourseAssignments();

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: COURSE_ASSIGNMENT_SUCCESS_MESSAGES.COURSE_ASSIGNMENT_FETCH_SUCCESS_MESSAGE,
            data: assignments
        });
    } catch (error: any) {
        console.error(`Error in fetching all course assignments: ${error.message}`);

        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_FETCH_ERROR_MESSAGE,
        });
    };
};

export default { getAllCourseAssignments };
