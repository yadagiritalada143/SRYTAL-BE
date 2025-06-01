import EmployeePackageModel from '../../model/employeePackageModel';
import { ObjectId } from 'mongoose';

interface IEmployeePackage {
  employeeId: ObjectId;
  packages: {
    packageId: ObjectId;
    tasks: {
      taskId: ObjectId;
      startDate: Date;
    }[];
  }[];
}

interface DeleteEmployeeTaskResponse {
  success: boolean;
  responseAfterDelete?: any;
}

const deleteEmployeeTaskServiceByAdmin = async (
  employeeId: string,
  packageId: string,
  taskId: string
): Promise<DeleteEmployeeTaskResponse> => {
  try {
    const employeePackageDoc = await EmployeePackageModel.findOne({ employeeId }) as IEmployeePackage;

    if (!employeePackageDoc) {
      return { success: false, responseAfterDelete: 'Employee package not found!' };
    }

    const packageToUpdate = employeePackageDoc.packages.find(
      (pkg) => pkg.packageId.toString() === packageId
    );

    if (!packageToUpdate) {
      return { success: false, responseAfterDelete: 'Package not found for employee!' };
    }

    const taskIndex = packageToUpdate.tasks.findIndex(
      (task) => task.taskId.toString() === taskId
    );

    if (taskIndex === -1) {
      return { success: false, responseAfterDelete: 'Task not found in the package!' };
    }

    packageToUpdate.tasks.splice(taskIndex, 1);

    const updatedDoc = await EmployeePackageModel.findOneAndUpdate(
      {
        employeeId,
        'packages.packageId': packageId
      },
      {
        $set: {
          'packages.$.tasks': packageToUpdate.tasks
        }
      },
      { new: true }
    );

    return {
      success: true,
      responseAfterDelete: updatedDoc
    };
  } catch (error) {
    console.error(`Error in deleting employee task: ${error}`);
    return { success: false };
  }
};

export default { deleteEmployeeTaskServiceByAdmin };
