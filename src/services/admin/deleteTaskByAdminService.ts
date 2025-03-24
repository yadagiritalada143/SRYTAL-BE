import TaskModel from '../../model/taskModel';

interface deleteTaskResponse {
    success: boolean;
    responseAfterDelete?: any;
}

const deleteTaskByAdmin = async (taskIdToDelete: string): Promise<deleteTaskResponse> => {
    try {
        const result = await TaskModel.deleteOne({ _id: taskIdToDelete });
        if (!result) {
            return { success: false, responseAfterDelete: result };
        }

        return { success: true, responseAfterDelete: result };
    } catch (error: any) {
        console.error(`Error in deleting task: ${error}`);
        return { success: false, responseAfterDelete: error }
    }
}

export default { deleteTaskByAdmin }
