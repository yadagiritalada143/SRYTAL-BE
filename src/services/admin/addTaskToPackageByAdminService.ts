
import TaskModel from '../../model/taskModel';
import PackagesModel from '../../model/packageModel';

const addTaskToPackageByAdmin = async (data: any): Promise<any> => {
    const taskData = new TaskModel(data);
    const afterAdd = await taskData.save();
    const tasksArray = [];
    tasksArray.push(afterAdd.id);
    const result = await PackagesModel.updateOne({ _id: data.packageId }, { tasks: tasksArray });
    if (result) {
        return { success: true, responseAfterUpdate: result };
    } else {
        return { success: false };
    }
}

export default { addTaskToPackageByAdmin }
