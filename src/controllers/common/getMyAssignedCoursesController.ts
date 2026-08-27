import { Request, Response } from 'express';
import getMyAssignedCoursesService from '../../services/common/getMyAssignedCoursesService';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import { MY_COURSES_ERROR_MESSAGES } from '../../constants/common/myCoursesMessages';

const getMyAssignedCourses = (req: Request, res: Response) => {
    getMyAssignedCoursesService
        .getMyAssignedCourses(req.user?.userId as string)
        .then(myCoursesResponse => {
            res.status(HTTP_STATUS.OK).json(myCoursesResponse);
        })
        .catch(error => {
            console.error(`Error in fetching assigned courses: ${error}`);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.MY_COURSES_FETCH_ERROR_MESSAGE
            });
        });
};

export default { getMyAssignedCourses };
