import { Request, Response } from 'express';
import addCourseByAdminService from '../../services/admin/addCourseByAdminService'; 
import { COURSES_ADD_SUCCESS_MESSAGES, COURSE_ERRORS_MESSAGES } from '../../constants/admin/courseMessages';

const addCourseByAdminController = (req: Request, res: Response) => {
    const { courseName, courseDescription } = req.body;
    addCourseByAdminService
        .addCourseByAdminService(courseName, courseDescription)
        .then((responseAfteraddingCourse) => {
            if (responseAfteraddingCourse.id) {
                return res
                    .status(201)
                    .json({ message: COURSES_ADD_SUCCESS_MESSAGES.COURSE_ADD_SUCCESS_MESSAGE });
            } else {
                return res
                    .status(400)
                    .json({ message: COURSE_ERRORS_MESSAGES.COURSE_ADD_ERROR_MESSAGE });
            }
        })
        .catch((error) => {
            console.log(error);
        });
    
}
export default { addCourseByAdminController };
