import { Request, Response } from 'express';
import taskProgressService from '../../services/admin/addTaskProgressService';
import { TASK_PROGRESS_ERROR_MESSAGES, TASK_PROGRESS_SUCCESS_MESSAGES } from '../../constants/admin/taskProgressMessages';

const addTaskProgress = async (req: Request, res: Response) => {
    try {
        const { courseAssignmentId, moduleId, taskId } = req.body;

        if (!courseAssignmentId || !moduleId || !taskId) {
            return res.status(400).json({
                success: false,
                message: TASK_PROGRESS_ERROR_MESSAGES.ADD_TASK_PROGRESS_ERROR_MESSAGE,
                    
            });
        }

        const taskProgress = await taskProgressService.addTaskProgress( courseAssignmentId, moduleId, taskId );

        return res.status(201).json({
            success: true,
            message: TASK_PROGRESS_SUCCESS_MESSAGES.ADD_TASK_PROGRESS_SUCCESS_MESSAGE,
            data: taskProgress,
        });
    } catch (error: any) {
        console.error(`Error in creating task progress: ${error.message}`);
        if (error.message === TASK_PROGRESS_ERROR_MESSAGES.TASK_PROGRESS_EXISTS) {
            return res.status(409).json({
                success: false,
                message: TASK_PROGRESS_ERROR_MESSAGES.TASK_PROGRESS_EXISTS,
            });
        }
        return res.status(400).json({
            success: false,
            message: TASK_PROGRESS_ERROR_MESSAGES.ADD_TASK_PROGRESS_ERROR_MESSAGE,
        });
    }
};

export default { addTaskProgress };