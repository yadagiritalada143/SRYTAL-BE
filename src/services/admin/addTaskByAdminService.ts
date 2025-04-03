
import TaskModel from '../../model/taskModel';

const addTaskByAdmin = async (data: any): Promise<any> => {
    const taskData = new TaskModel(data);
    const afterAdd = await taskData.save();
}

export default { addTaskByAdmin }
