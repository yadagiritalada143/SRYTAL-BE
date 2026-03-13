import TaskModel from '../../model/taskModel';
import { IDeleteTaskResponse } from '../../interfaces/task';

const hardDeleteTaskByAdmin = async (taskIdToDelete: any): Promise<IDeleteTaskResponse> => {
    return new Promise(async (resolve, reject) => {
        await TaskModel.deleteOne(
            { _id: taskIdToDelete })
            .then((responseAfterHardDeletingTask: any) => {
                resolve({ success: true });
            })
            .catch((error: any) => {
                console.error(`Error in hard deleting task: ${error}`);
                reject({ success: false });
            });
    });
}

const softDeleteTaskByAdmin = async (taskIdToDelete: string): Promise<IDeleteTaskResponse> => {
    return new Promise(async (resolve, reject) => {
        await TaskModel.updateOne(
            { _id: taskIdToDelete },
            { isDeleted: true })
            .then((responseAfterSoftDeletingTask: any) => {
                resolve({ success: true });
            })
            .catch((error: any) => {
                console.error(`Error in soft deleting task: ${error}`);
                reject({ success: false });
            });
    });
}

export default { hardDeleteTaskByAdmin, softDeleteTaskByAdmin };
