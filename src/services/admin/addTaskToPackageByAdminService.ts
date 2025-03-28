
import TaskModel from '../../model/taskModel';
import PackagesModel from '../../model/packageModel';

const addTaskToPackageByAdmin = async (data: any): Promise<any> => {
    const taskData = new TaskModel(data);
    const afterAdd = await taskData.save();
    const result = await PackagesModel.findByIdAndUpdate({ _id: data.packageId }, {
        $push: {
            tasks: afterAdd.id
        }
    });
    if (result) {
        return { success: true, responseAfterUpdate: result };
    } else {
        return { success: false };
    }
}

export default { addTaskToPackageByAdmin }
