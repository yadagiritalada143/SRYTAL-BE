import { Request, Response } from 'express';
import addNewCourseService from '../../services/contentwriter/addCourseService';
import { COURSE_SUCCESS_MESSAGES, COURSE_ERROR_MESSAGES } from '../../constants/contentwriter/courseMessages';

const addNewCourse = (req: Request, res: Response) => {
    const { courseName, courseDescription } = req.body;
    addNewCourseService
        .addCourseService(courseName, courseDescription)
        .then((responseAfteraddingCourse: any) => {
            if (responseAfteraddingCourse._id) {
                return res
                    .status(201)
                    .json({ message: COURSE_SUCCESS_MESSAGES.COURSE_ADD_SUCCESS_MESSAGE });
            } else {
                return res
                    .status(400)
                    .json({ message: COURSE_ERROR_MESSAGES.COURSE_ADD_ERROR_MESSAGE });
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({ success: false, message: COURSE_ERROR_MESSAGES.COURSE_ADD_ERROR_MESSAGE });
        });
}

export default { addNewCourse };
