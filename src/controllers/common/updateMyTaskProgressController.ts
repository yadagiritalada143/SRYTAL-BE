import { Request, Response } from 'express';
import updateMyTaskProgressService from '../../services/common/updateMyTaskProgressService';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import {
    MY_COURSES_ERROR_MESSAGES,
    MY_COURSES_SUCCESS_MESSAGES
} from '../../constants/common/myCoursesMessages';

const updateMyTaskProgress = async (req: Request, res: Response) => {
    try {
        const { courseAssignmentId, taskId, isCompleted } = req.body;

        if (!courseAssignmentId || !taskId || typeof isCompleted !== 'boolean') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.TASK_PROGRESS_MISSING_FIELDS_MESSAGE
            });
        }

        const progressResponse = await updateMyTaskProgressService.updateMyTaskProgress(
            courseAssignmentId,
            taskId,
            isCompleted,
            req.user?.userId as string
        );

        if (progressResponse.notFound) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.MY_COURSE_NOT_FOUND_MESSAGE
            });
        }

        if (progressResponse.invalidTask) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.TASK_NOT_IN_COURSE_MESSAGE
            });
        }

        return res.status(HTTP_STATUS.OK).json({
            ...progressResponse,
            message: MY_COURSES_SUCCESS_MESSAGES.TASK_PROGRESS_UPDATE_SUCCESS_MESSAGE
        });
    } catch (error: any) {
        console.error(`Error in updating task progress: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.TASK_PROGRESS_UPDATE_ERROR_MESSAGE
        });
    }
};

export default { updateMyTaskProgress };
