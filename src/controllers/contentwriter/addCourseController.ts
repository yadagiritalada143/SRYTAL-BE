import { Request, Response } from 'express';
import addNewCourseService from '../../services/contentwriter/addCourseService';
import { COURSE_ADD_SUCCESS_MESSAGES, COURSE_ERRORS_MESSAGES  } from '../../constants/contentwriter/courseMessages';

const addNewCourseController = (req: Request, res: Response) => {
    const {  courseName, courseDescription } = req.body;
    addNewCourseService
        .addCourseService( courseName, courseDescription)
        .then((responseAfteraddingCourse) => {
            if (responseAfteraddingCourse.id) {
                return res
                    .status(201)
                    .json({ message: COURSE_ADD_SUCCESS_MESSAGES.COURSE_ADD_SUCCESS_MESSAGE });
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
export default { addNewCourseController };
