import { Request, Response } from 'express';
import updateCourseService from '../../services/contentwriter/updateCourseService'
import { COURSE_ERROR_MESSAGES } from '../../constants/contentwriter/courseMessages';
import isValidStatus from '../../util/validateCourseStatusTypesUtil';

const updateCourseController = async (req: Request, res: Response) => {
    try {
        const { id, courseName, courseDescription, thumbnail, status } = req.body;

        if (!isValidStatus(status)) {
            return res.status(400).json({
                success: false,
                message: COURSE_ERROR_MESSAGES.COURSE_INVALID_STATUS_MESSAGE,
            });
        }

        const updateCourseResponse = await updateCourseService.updateCourse(
            id,
            courseName,
            courseDescription,
            thumbnail,
            status.toUpperCase(),
        );
        res.status(200).json(updateCourseResponse);
    } catch (error: any) {
        console.error(`Error in updating course: ${error}`);
        res.status(500).json({
            success: false,
            message: COURSE_ERROR_MESSAGES.COURSE_UPDATE_ERROR_MESSAGE,
        });
    }
};

export default { updateCourseController };
