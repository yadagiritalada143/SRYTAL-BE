import mongoose from 'mongoose';
import TaskProgressModel from '../../model/taskProgressModel';
import { TASK_PROGRESS_ERROR_MESSAGES } from '../../constants/admin/taskProgressMessages';

const addTaskProgress = async (courseAssignmentId: string, moduleId: string, taskId: string ): Promise<any> => {
    try {
        if (!courseAssignmentId) {
            throw new Error(
                'Invalid course assignment ID'
            );
        }

        if (!moduleId) {
            throw new Error('Invalid module ID');
        }

        if (!taskId) {
            throw new Error('Invalid task ID');
        }

        // Check whether progress already exists
        const existingProgress = await TaskProgressModel.findOne({ courseAssignmentId, moduleId, taskId });

        if (existingProgress) {
            throw new Error(TASK_PROGRESS_ERROR_MESSAGES.TASK_PROGRESS_EXISTS);
        }

        const taskProgress = await TaskProgressModel.create({
                courseAssignmentId,
                moduleId,
                taskId,
                isCompleted: false,
                completedAt: null,
            });

        return taskProgress;
    } catch (error: any) {
        console.error(`Error in creating task progress:${error.message}`);

        throw error;
    }
};

export default { addTaskProgress };
