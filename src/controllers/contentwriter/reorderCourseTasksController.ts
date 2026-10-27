import { Request, Response } from 'express';
import reorderCourseTasksService from '../../services/contentwriter/reorderCourseTasksService';
import { COURSE_TASK_SUCCESS_MESSAGES, COURSE_TASK_ERRORS_MESSAGES } from '../../constants/contentwriter/coursetaskMessages';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';

const reorderCourseTasks = async (req: Request, res: Response) => {
    try {
        const { moduleId, tasks } = req.body;
        const result = await reorderCourseTasksService.reorderCourseTasks(moduleId, tasks);

        if (result.success) {
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: COURSE_TASK_SUCCESS_MESSAGES.COURSE_TASK_REORDER_SUCCESS_MESSAGE,
                data: result.data
            });
        }

        switch (result.errorCode) {
            case 'INVALID_MODULE_ID':
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_MODULE_ID_MESSAGE
                });
            case 'MODULE_NOT_FOUND':
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_MODULE_NOT_FOUND_MESSAGE
                });
            case 'INVALID_TASKS':
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_TASKS_REQUIRED_MESSAGE
                });
            case 'INVALID_TASK_ID':
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_TASK_ID_MESSAGE
                });
            case 'TASK_NOT_FOUND':
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_TASK_NOT_FOUND_MESSAGE
                });
            case 'TASK_NOT_IN_MODULE':
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_NOT_IN_MODULE_MESSAGE
                });
            case 'DUPLICATE_TASK_ID':
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_DUPLICATE_TASK_ID_MESSAGE
                });
            case 'INVALID_ORDER_IDX':
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_ORDER_IDX_MESSAGE
                });
            case 'DUPLICATE_ORDER_IDX':
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_DUPLICATE_ORDER_IDX_MESSAGE
                });
            default:
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_REORDER_ERROR_MESSAGE
                });
        }
    } catch (error: any) {
        console.error(`Error in reordering course tasks: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_REORDER_ERROR_MESSAGE
        });
    }
};

export default { reorderCourseTasks };
