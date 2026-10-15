import { Request, Response } from 'express';
import cloneCourseService from '../../services/contentwriter/cloneCourseService';
import { COURSE_CLONE_ERROR_CODES, COURSE_ERROR_MESSAGES, COURSE_SUCCESS_MESSAGES } from '../../constants/contentwriter/courseMessages';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';

const errorCodeToStatus = (code?: string): number => {
    switch (code) {
        case COURSE_CLONE_ERROR_CODES.SOURCE_NOT_FOUND:
            return HTTP_STATUS.NOT_FOUND;
        case COURSE_CLONE_ERROR_CODES.SOURCE_NOT_ARCHIVED:
        case COURSE_CLONE_ERROR_CODES.INVALID_MODULE:
        case COURSE_CLONE_ERROR_CODES.INVALID_TASK:
            return HTTP_STATUS.BAD_REQUEST;
        default:
            return HTTP_STATUS.INTERNAL_SERVER_ERROR;
    }
};

const cloneCourse = async (req: Request, res: Response) => {
    try {
        const { courseId, courseName, modules } = req.body;

        const responseAfterCloning = await cloneCourseService.cloneCourse({
            courseId,
            courseName,
            modules
        });

        if (!responseAfterCloning.success || !responseAfterCloning.data) {
            return res
                .status(errorCodeToStatus(responseAfterCloning.code))
                .json({
                    success: false,
                    message:
                        responseAfterCloning.message ||
                        COURSE_ERROR_MESSAGES.COURSE_CLONE_ERROR_MESSAGE
                });
        }

        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: COURSE_SUCCESS_MESSAGES.COURSE_CLONE_SUCCESS_MESSAGE,
            data: responseAfterCloning.data
        });
    } catch (error: any) {
        console.error(`Error in cloning Course: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: COURSE_ERROR_MESSAGES.COURSE_CLONE_ERROR_MESSAGE
        });
    }
};

export default { cloneCourse };
