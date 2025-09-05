import { Request, Response } from 'express';
import getAllCoursesService from '../../services/contentwriter/getAllCoursesService';
import { COURSE_ERROR_MESSAGES } from '../../constants/contentwriter/courseMessages';

const getAllCourses = (req: Request, res: Response) => {
      const status = "ACTIVE";
    getAllCoursesService.AllCoursesService(status)
        .then((FetchAllCoursesResponse: any) => {
            res.status(200).json(FetchAllCoursesResponse);
        })
        .catch(error => {
            console.error(`Error in fetching courses: ${error}`);
            res.status(500).json({ success: false, message: COURSE_ERROR_MESSAGES.COURSE_FETCH_ERROR_MESSAGE });
        });
};

export default { getAllCourses }
