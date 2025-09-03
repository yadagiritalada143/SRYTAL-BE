import { Request, Response } from 'express';
import getCourseByIdService from '../../services/contentwriter/getCourseByIdService';
import { COURSE_ERROR_MESSAGES } from '../../constants/contentwriter/courseMessages';

const getCourseDetailsById = (req: Request, res: Response) => {
    const { id } = req.params;
    getCourseByIdService.getCourseById(id)
        .then(CourseByIdResponse => {
            res.status(200).json(CourseByIdResponse);
        })
        .catch(error => {
            console.error(`Error in fetching course by Id: ${error}`);
            res.status(500).json({ success: false, message: COURSE_ERROR_MESSAGES.COURSE_ADD_ERROR_MESSAGE });
        });
};

export default { getCourseDetailsById }
