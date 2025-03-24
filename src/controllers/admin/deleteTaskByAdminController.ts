import { Request, Response } from 'express';
import deleteTaskByAdminService from '../../services/admin/deleteTaskByAdminService';
import { TASK_ERROR_MESSAGES } from '../../constants/admin/taskMessages';

const deleteTaskByAdmin = (req: Request, res: Response) => {
    const { id } = req.params;
    deleteTaskByAdminService
        .deleteTaskByAdmin(id)
        .then((deleteTaskResponse: any) => {
            res.status(200).json(deleteTaskResponse);
        })
        .catch((error: any) => {
            console.error(`Error in deleting task: ${error}`);
            res.status(500).json({ success: false, message: TASK_ERROR_MESSAGES.TASK_DELETE_ERROR_MESSAGE });
        });
}

export default { deleteTaskByAdmin }
