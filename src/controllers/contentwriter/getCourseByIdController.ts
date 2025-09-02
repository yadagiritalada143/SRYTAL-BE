import { Request, Response } from 'express';
import getCourseById from '../../services/contentwriter/getCourseByIdService';
import { COURSE_ERRORS_MESSAGES } from '../../constants/contentwriter/coursesMessages';

const getCourseByIdController = (req: Request, res: Response) => {
    const { id } = req.params;
    getCourseById.getCourseByIdService(id)
        .then(CourseByIdResponse => {
            res.status(200).json(CourseByIdResponse);
        })
        .catch(error => {
            console.error(`Error in fetching course by Id: ${error}`);
            res.status(500).json({ success: false, message: COURSE_ERRORS_MESSAGES.COURSE_FETCH_ERROR_MESSAGES });
        });
};

export default { getCourseByIdController }