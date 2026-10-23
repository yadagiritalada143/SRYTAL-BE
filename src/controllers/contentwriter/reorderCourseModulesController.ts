import { Request, Response } from 'express';
import reorderCourseModulesService from '../../services/contentwriter/reorderCourseModulesService';
import { COURSE_MODULE_ERRORS_MESSAGES, COURSE_MODULE_SUCCESS_MESSAGES } from '../../constants/contentwriter/coursemoduleMessages';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';

const reorderCourseModules = async (req: Request, res: Response) => {
    try {
        const { courseId, modules } = req.body;
        
        const result = await reorderCourseModulesService.reorderCourseModules(courseId, modules);

        if (result.success) {
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: COURSE_MODULE_SUCCESS_MESSAGES.COURSE_MODULE_REORDER_SUCCESS_MESSAGE,
                data: result.data
            });
        }

        switch (result.errorCode) {
            case 'INVALID_COURSE_ID':
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_INVALID_COURSE_ID_MESSAGE
                });
            case 'COURSE_NOT_FOUND':
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_COURSE_NOT_FOUND_MESSAGE
                });
            case 'INVALID_MODULES':
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_MODULES_REQUIRED_MESSAGE
                });
            case 'INVALID_MODULE_ID':
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_INVALID_MODULE_ID_MESSAGE
                });
            case 'MODULE_NOT_FOUND':
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_MODULE_NOT_FOUND_MESSAGE
                });
            case 'MODULE_NOT_IN_COURSE':
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_NOT_IN_COURSE_MESSAGE
                });
            case 'DUPLICATE_MODULE_ID':
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_DUPLICATE_MODULE_ID_MESSAGE
                });
            case 'INVALID_ORDER_IDX':
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_INVALID_ORDER_IDX_MESSAGE
                });
            case 'DUPLICATE_ORDER_IDX':
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_DUPLICATE_ORDER_IDX_MESSAGE
                });
            default:
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_REORDER_ERROR_MESSAGE
                });
        }
    } catch (error: any) {
        console.error(`Error in reordering course modules: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_REORDER_ERROR_MESSAGE
        });
    }
};

export default { reorderCourseModules };
