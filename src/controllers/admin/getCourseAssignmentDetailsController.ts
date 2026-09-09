import { Request, Response } from 'express';
import getAdminCourseAssignmentDetailsService from '../../services/admin/getAdminCourseAssignmentDetailsService';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import { COURSE_ASSIGNMENT_ERRORS_MESSAGES, COURSE_ASSIGNMENT_SUCCESS_MESSAGES } from '../../constants/admin/courseAssignmentMessages';

const getCourseAssignmentDetails = async (req: Request, res: Response) => {
    try {
        const { courseAssignmentId } = req.params;

        if (!courseAssignmentId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_MISSING_FIELDS_MESSAGE
            });
        }

        const response = await getAdminCourseAssignmentDetailsService.getAdminCourseAssignmentDetails(courseAssignmentId);

        if (!response.success) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE
            });
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: COURSE_ASSIGNMENT_SUCCESS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_FETCH_SUCCESS_MESSAGE,
            data: response
        });
    } catch (error: any) {
        console.error(`Error in fetching course assignment details: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_FETCH_ERROR_MESSAGE
        });
    }
};

export default { getCourseAssignmentDetails };
