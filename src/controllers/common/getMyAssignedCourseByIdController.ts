import { Request, Response } from 'express';
import getMyAssignedCourseByIdService from '../../services/common/getMyAssignedCourseByIdService';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import { MY_COURSES_ERROR_MESSAGES } from '../../constants/common/myCoursesMessages';

const getMyAssignedCourseById = async (req: Request, res: Response) => {
    try {
        const { courseAssignmentId } = req.params;

        const myCourseResponse = await getMyAssignedCourseByIdService.getMyAssignedCourseById(
            courseAssignmentId,
            req.user?.userId as string
        );

        if (!myCourseResponse.success) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.MY_COURSE_NOT_FOUND_MESSAGE
            });
        }

        return res.status(HTTP_STATUS.OK).json(myCourseResponse);
    } catch (error: any) {
        console.error(`Error in fetching assigned course by id: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.MY_COURSE_FETCH_ERROR_MESSAGE
        });
    }
};

export default { getMyAssignedCourseById };
