import { Request, Response } from 'express';
import fetchAssignedCoursesForEmployeeService from '../../services/admin/fetchAssignedCoursesForEmployeeService';
import { COURSE_ASSIGNMENT_ERRORS_MESSAGES } from '../../constants/admin/courseAssignmentMessages';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';

const fetchAssignedCoursesForEmployee = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const result = await fetchAssignedCoursesForEmployeeService.fetchAssignedCoursesForEmployee(userId);

        return res.status(HTTP_STATUS.OK).json({
            success: result.success,
            message: result.message,
            data: result.data
        });
    } catch (error: any) {
        console.error(`Error in fetching assigned courses for employee: ${error.message}`);

        if (error.message === COURSE_ASSIGNMENT_ERRORS_MESSAGES.ASSIGNED_COURSES_EMPLOYEE_NOT_FOUND_MESSAGE) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.ASSIGNED_COURSES_EMPLOYEE_NOT_FOUND_MESSAGE
            });
        }

        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.ASSIGNED_COURSES_FETCH_ERROR_MESSAGE
        });
    }
};

export default { fetchAssignedCoursesForEmployee };
