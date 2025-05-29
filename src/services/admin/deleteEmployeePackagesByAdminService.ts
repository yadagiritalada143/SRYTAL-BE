import EmployeePackageModel from '../../model/employeePackageModel';
import TaskModel from '../../model/taskModel';

interface deleteEmployeePackagesResponse {
    success: boolean;
    responseAfterDelete?: any;
}

const DeleteEmployeePackageServiceByAdmin = async (employeeId: string, packageId:string ): Promise<deleteEmployeePackagesResponse> => {
    try {
        const employeePackage = await EmployeePackageModel.findById(employeeId);

        if (!employeePackage) {
            return { success: false };
        }

        const deletedPackage = await EmployeePackageModel.findByIdAndDelete(packageId);

        await TaskModel.deleteMany({
            employeeId: employeePackage.employeeId,
            packageId: employeePackage.packageId
        });

        return { success: true, responseAfterDelete: deletedPackage };
    } catch (error: any) {
        console.error(`Error in deleting Employee package and its task: ${error}`);
        return { success: false, responseAfterDelete: error };
    }
}

export default { DeleteEmployeePackageServiceByAdmin };
