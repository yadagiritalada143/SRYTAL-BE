import TaskModel from '../../model/taskModel';

interface deleteTaskResponse {
    success: boolean;
}

const hardDeleteTaskByAdmin = async (taskIdToDelete: string): Promise<deleteTaskResponse> => {
    return new Promise(async (resolve, reject) => {
        await TaskModel.deleteOne(
            { _id: taskIdToDelete })
            .then((responseAfterTaskHardDelete: any) => {
                resolve({ success: true });
            })
            .catch((error: any) => {
                console.error(`Error in (hard) deleting task: ${error}`);
                reject({ success: false });
            });
    });
}

const softDeleteTaskByAdmin = async (taskIdToDelete: string): Promise<deleteTaskResponse> => {
    return new Promise(async (resolve, reject) => {
        await TaskModel.updateOne(
            { _id: taskIdToDelete },
            { isDeleted: true })
            .then((responseAfterTaskSoftDelete: any) => {
                resolve({ success: true });
            })
            .catch((error: any) => {
                console.error(`Error in (soft) deleting task: ${error}`);
                reject({ success: false });
            });
    });
}

export default { hardDeleteTaskByAdmin, softDeleteTaskByAdmin };
