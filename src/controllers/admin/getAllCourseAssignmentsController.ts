import { Request, Response } from "express";
import getAllCourseAssignmentsService from '../../services/admin/getAllCourseAssignmentsService';
import { COURSE_ASSIGNMENT_SUCCESS_MESSAGES, COURSE_ASSIGNMENT_ERRORS_MESSAGES } from '../../constants/admin/courseAssignmentMessages';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';

const getAllCourseAssignments = async (req: Request, res: Response) => {
    try {
        const { employeeId, employeeName, page, limit } = req.query;

        const result = await getAllCourseAssignmentsService.getAllCourseAssignments({
            employeeId: typeof employeeId === 'string' ? employeeId : undefined,
            employeeName: typeof employeeName === 'string' ? employeeName : undefined,
            page: typeof page === 'string' && page.trim() !== '' ? Number(page) : undefined,
            limit: typeof limit === 'string' && limit.trim() !== '' ? Number(limit) : undefined
        });

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: COURSE_ASSIGNMENT_SUCCESS_MESSAGES.COURSE_ASSIGNMENT_FETCH_SUCCESS_MESSAGE,
            data: result.data,
            pagination: result.pagination
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
