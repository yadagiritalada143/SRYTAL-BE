import { Request, Response } from 'express';
import addTaskPackageToByAdminService from '../../services/admin/addTaskToPackageByAdminService';
import { TASK_ERROR_MESSAGES } from '../../constants/admin/taskMessages';

const addTasktoPackageByAdminController = (req: Request, res: Response) => {
    let taskDetails = req.body;
    taskDetails.createdAt = new Date();
    taskDetails.lastUpdatedAt = new Date();
    taskDetails.createdBy = req.body.userId;
    addTaskPackageToByAdminService
        .addTaskToPackageByAdmin(taskDetails)
        .then((responseAfteraddingTask: any) => {
            res.status(200).json(responseAfteraddingTask);
        })
        .catch((error: any) => {
            console.log(`Error while adding Tasks: ${error}`);
            res.status(500).json({ success: false, message: TASK_ERROR_MESSAGES.TASK_ADD_ERROR_MESSAGE });
        });
};

export default { addTasktoPackageByAdminController };
