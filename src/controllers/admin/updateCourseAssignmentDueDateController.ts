import { Request, Response } from "express";
import courseAssignmentDueDateService from '../../services/admin/updateCourseAssignmentDueDateService'
import { COURSE_ASSIGNMENT_SUCCESS_MESSAGES, COURSE_ASSIGNMENT_ERRORS_MESSAGES } from '../../constants/admin/courseAssignmentMessages';


const updateCourseAssignmentDueDate = async (req: Request, res: Response) => {
    try {
        const { courseAssignmentId } = req.params;
        const { dueDate } = req.body;


        if (!courseAssignmentId || !dueDate) {
            return res.status(400).json({
                success: false,
                message: 'courseAssignmentId and dueDate are required !'
            });
        }


        const assignment = await courseAssignmentDueDateService.updateCourseAssignmentDueDate(courseAssignmentId, dueDate);


        res.status(200).json({
            success: true,
            message: 'Course assignment due date updated successfully !',
            data: assignment
        });
    } catch (error: any) {
        console.error(`Error in updating course assignment due date: ${error.message}`);


        if (error.message === COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE) {
            return res.status(404).json({
                success: false,
                message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE
            });
        }


        return res.status(400).json({
            success: false,
            message: 'Error occurred while updating course assignment due date !'
        });
    }
};


export default { updateCourseAssignmentDueDate };
