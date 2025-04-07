import TaskModel from "../../model/taskModel";
import PackagesModel from "../../model/packageModel";

const addTaskByAdmin = async (data: any): Promise<any> => {
  // 1. Create task
  const taskData = new TaskModel(data);
  const afterAdd = await taskData.save();

  // 2. Add task._id to related package's tasks array
  if (afterAdd.packageId) {
    await PackagesModel.findByIdAndUpdate(
      afterAdd.packageId,
      { $push: { tasks: afterAdd._id } },
      { new: true }
    );
  }

  return afterAdd;
};

export default { addTaskByAdmin };
