import { Request, Response } from 'express';
import getAllActiveCoursesService from '../../services/contentwriter/getAllActiveCoursesService';
import { COURSE_ERROR_MESSAGES, COURSE_SUCCESS_MESSAGES } from '../../constants/contentwriter/courseMessages';

const getAllActiveCourses = async (req: Request, res: Response) => {
    try {
        const data = await getAllActiveCoursesService.AllActiveCourses();

        return res.status(200).json({
            success: true,
            message: COURSE_SUCCESS_MESSAGES.ACTIVE_COURSES_FETCH_SUCCESS_MESSAGE,
            courses: data.courses,
            totalActiveCourses: data.totalActiveCourses,
        });
    } catch (error: any) {
        console.error(`Error in fetching active courses: ${error}`);
        res.status(500).json({ success: false, message: COURSE_ERROR_MESSAGES.COURSE_FETCH_ERROR_MESSAGE });
    }
};

export default { getAllActiveCourses };
