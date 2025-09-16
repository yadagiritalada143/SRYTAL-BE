import { Request, Response } from 'express';
import updateCourseTaskService from '../../services/contentwriter/updateCourseTaskService';
import { COURSE_TASK_ERRORS_MESSAGES } from '../../constants/contentwriter/coursetaskMessages';
import isValidStatus from '../../util/validateCourseStatusTypesUtil';

const updateCourseTaskController = async (req: Request, res: Response) => {
    try {
        const { id, taskName, taskDescription, thumbnail, status } = req.body;

        if (!isValidStatus(status)) {
            return res.status(400).json({
                success: false,
                message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_STATUS_MESSAGE,
            });
        }

        const updateCourseResponse = await updateCourseTaskService.updateCourseTask(
            id,
            taskName,
            taskDescription,
            thumbnail,
            status.toUpperCase(),
        );
        res.status(200).json(updateCourseResponse);
    } catch (error: any) {
        console.error(`Error in updating course task: ${error}`);
        res.status(500).json({
            success: false,
            message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_UPDATE_ERROR_MESSAGE,
        });
    }
};

export default { updateCourseTaskController };
