import { Request, Response } from 'express';
import getAllCoursesService from '../../services/contentwriter/getAllCoursesService';
import { COURSE_ERROR_MESSAGES } from '../../constants/contentwriter/courseMessages';

const getAllCourses = async(req: Request, res: Response) => {
    try {
        const courses = await getAllCoursesService.AllCourses();

       return res.status(200).json({
            success: true,
            courses: courses,
        });
    } catch (error: any) {
        console.error(`Error in fetching courses: ${error}`);
        res.status(500).json({ success: false, message: COURSE_ERROR_MESSAGES.COURSE_FETCH_ERROR_MESSAGE });
    }
    // getAllCoursesService.AllCourses()
    //     .then((FetchAllCoursesResponse: any) => {
    //         res.status(200).json(FetchAllCoursesResponse);
    //     })
    //     .catch(error => {
    //         console.error(`Error in fetching courses: ${error}`);
    //         res.status(500).json({ success: false, message: COURSE_ERROR_MESSAGES.COURSE_FETCH_ERROR_MESSAGE });
    //     });
};

export default { getAllCourses }
