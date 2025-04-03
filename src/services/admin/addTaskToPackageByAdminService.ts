
import TaskModel from '../../model/taskModel';

const addTaskToPackageByAdmin = async (data: any): Promise<any> => {
    const taskData = new TaskModel(data);
    const afterAdd = await taskData.save();
}

export default { addTaskToPackageByAdmin }
