import { Request, Response } from 'express';
import updateTaskService from '../../services/admin/updateTaskByAdminService';
import { TASK_ERROR_MESSAGES } from '../../constants/admin/taskMessages';

const updateTaskByAdminController = (req: Request, res: Response) => {
    const taskDetails = req.body;
    taskDetails.lastUpdatedBy = new Date();
    updateTaskService
        .updateTaskByAdmin(taskDetails)
        .then((updateTaskResponse: any) => {
            res.status(200).json(updateTaskResponse);
        })
        .catch((error: any) => {
            console.error(`Error in  updating task: ${error}`);
            res.status(500).json({ success: false, message: TASK_ERROR_MESSAGES.TASK_UPDATING_ERROR_MESSAGE });
        });

}

export default { updateTaskByAdminController }
