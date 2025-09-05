import { Request, Response } from 'express';
import updateCourseTaskService from '../../services/contentwriter/updateCourseTaskService';
import { COURSE_TASK_ERRORS_MESSAGES } from '../../constants/contentwriter/coursetaskMessages';

const updateCourseTaskController = (req: Request, res: Response) => {
 const { id, taskName, taskDescription, status } = req.body;
    updateCourseTaskService
        .updateCourseTask(id, taskName, taskDescription, status)
        .then((updateCourseResponse: any) => {
            res.status(200).json(updateCourseResponse);
        })
        .catch((error: any) => {
            console.error(`Error in updating course task: ${error}`);
            res.status(500).json({ success: false, message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_UPDATE_ERROR_MESSAGE });
        });
}

export default { updateCourseTaskController };
