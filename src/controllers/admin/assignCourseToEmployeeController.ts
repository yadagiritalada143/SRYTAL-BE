import { Request, Response } from 'express';
import assignCourseToEmployeeService from '../../services/admin/assignCourseToEmployeeService';
import { COURSE_ASSIGNMENT_SUCCESS_MESSAGES, COURSE_ASSIGNMENT_ERRORS_MESSAGES } from '../../constants/admin/courseAssignmentMessages';

const assignCourseToEmployee = async (req: Request, res: Response) => {

    try {

        const { courseId, employeeId, dueDate } = req.body;

        const assignedByAdminId = (req as any).user?.userId;

        if (!courseId || !employeeId || !dueDate) {
            return res.status(400).json({
                success: false,
                message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_MISSING_FIELDS_MESSAGE
            });
        };

        const result = await assignCourseToEmployeeService.assignCourseToEmployee( courseId, employeeId, assignedByAdminId, dueDate );

        return res.status(201).json({
            success: true,
            message: COURSE_ASSIGNMENT_SUCCESS_MESSAGES.COURSE_ASSIGNMENT_CREATE_SUCCESS_MESSAGE,
            data: result,
        });

    } catch (error: any) {
        console.error(`Error in assigning course to employee: ${error.message}`);

        if (error.message === COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_ALREADY_ASSIGNED_MESSAGE) {
            return res.status(409).json({
                success: false,
                message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_ALREADY_ASSIGNED_MESSAGE
            });
        }

        return res.status(400).json({
            success: false,
            message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_CREATE_ERROR_MESSAGE
        });
    }
};

export default { assignCourseToEmployee};