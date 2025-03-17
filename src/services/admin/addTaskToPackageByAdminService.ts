
import TaskModel from '../../model/taskModel';
import { ITask } from '../../interfaces/task';

const addTaskToPackageByAdmin = async (data: ITask): Promise<any> => {
    const taskData = new TaskModel(data);
    return await taskData.save();
}

export default { addTaskToPackageByAdmin }
