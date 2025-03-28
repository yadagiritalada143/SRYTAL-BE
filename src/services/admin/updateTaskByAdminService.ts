import TaskModel from '../../model/taskModel';

interface updateTaskResponse {
    success: boolean;
    responseAfterUpdate?: any;
}

const updateTaskByAdmin = async (taskDetails: any): Promise<updateTaskResponse> => {
    try {
        const result = await TaskModel.updateOne({ _id: taskDetails.id }, { ...taskDetails });
        if (result) {
            return { success: true, responseAfterUpdate: result };
        } else {
            return { success: false };
        }
    } catch (error: any) {
        console.error(`Error in updating task: ${error}`)
        return { success: false, responseAfterUpdate: error }
    }
}

export default { updateTaskByAdmin };
