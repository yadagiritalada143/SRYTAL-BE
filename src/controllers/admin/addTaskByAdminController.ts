import { Request, Response } from 'express';
import addTaskByAdminService from '../../services/admin/addTaskByAdminService';
import { TASK_ERROR_MESSAGES } from '../../constants/admin/taskMessages';

const addTaskByAdminController = (req: Request, res: Response) => {
    let taskDetails = req.body;
    taskDetails.createdAt = new Date();
    taskDetails.lastUpdatedAt = new Date();
    taskDetails.createdBy = req.body.userId;
    taskDetails.isDeleted = false;
    addTaskByAdminService
        .addTaskByAdmin(taskDetails)
        .then((responseAfteraddingTask: any) => {
            res.status(200).json(responseAfteraddingTask);
        })
        .catch((error: any) => {
            console.log(`Error while adding Tasks: ${error}`);
            res.status(500).json({ success: false, message: TASK_ERROR_MESSAGES.TASK_ADD_ERROR_MESSAGE });
        });
};

export default { addTaskByAdminController };
