import EmployeePackageModel from '../../model/employeePackageModel';
import TaskModel from '../../model/taskModel';

interface FetchEmployeePackagesDetailsResponse {
    success: boolean;
    employeePackageDetails?: any;
}

const getEmployeePackageDetailsByAdmin = async (id: string): Promise<FetchEmployeePackagesDetailsResponse> => {
    try {
        const employeePackageDetails = await EmployeePackageModel.find({ employeeId: id })
            .populate('packages.packageId')
            .populate('packages.tasks.taskId');

        if (!employeePackageDetails) {
            return { success: false };
        }

        return {
            success: true,
            employeePackageDetails
        };
    } catch (error) {
        console.error('Error in fetching Employee Package details:', error);
        return { success: false };
    }
};

export default { getEmployeePackageDetailsByAdmin };
