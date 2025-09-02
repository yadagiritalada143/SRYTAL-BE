import { Request, Response } from 'express';
import getAllCoursesService from '../../services/contentwriter/getAllCoursesService';
import { COURSE_ERRORS_MESSAGES } from '../../constants/contentwriter/coursesMessages';

const getAllCourses  = (req: Request, res: Response) => {
    getAllCoursesService.AllCoursesService()
        .then((FetchAllCoursesResponse: any) => {
            res.status(200).json(FetchAllCoursesResponse);
        })
        .catch(error => {
            console.error(`Error in fetching courses: ${error}`);
            res.status(500).json({ success: false, message: COURSE_ERRORS_MESSAGES.COURSE_FETCH_ERROR_MESSAGES });
        });
};

export default { getAllCourses }
