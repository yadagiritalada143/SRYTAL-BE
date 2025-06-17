import EmployeePackageModel from '../../model/employeePackageModel';

interface FetchEmployeePackagesDetailsResponse {
    success: boolean;
    employeePackageDetails?: any;
}

const employeePackageDetailsById = async (employeeId: string): Promise<FetchEmployeePackagesDetailsResponse> => {
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
        console.error('Error in fetching Employee Package details by ID:', error);
        return { success: false };
    }
};

export default { employeePackageDetailsById };
