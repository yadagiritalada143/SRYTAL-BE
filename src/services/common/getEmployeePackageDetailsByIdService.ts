import EmployeePackageModel from '../../model/employeePackageModel';

interface FetchEmployeePackagesDetailsResponse {
    success: boolean;
    employeePackageDetails?: any;
}

const getEmployeePackageDetailsById = async (employeeId: string): Promise<FetchEmployeePackagesDetailsResponse> => {
    try {

        const employeePackageDetails = await EmployeePackageModel.find({ employeeId })
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

export default { getEmployeePackageDetailsById };
