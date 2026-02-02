import EmployeePackageModel from '../../model/employeePackageModel';

interface FetchEmployeePackagesDetailsResponse {
    success: boolean;
    employeePackageDetails?: any;
}

const getEmployeePackageDetailsByAdmin = async (employeeId: string): Promise<FetchEmployeePackagesDetailsResponse> => {
    try {
        const employeePackageDetails = await EmployeePackageModel.find({ employeeId })
            .populate('packages.packageId')
            .populate({
                path: 'packages.tasks.taskId',
                select: '-timesheet'
            });
            
        if (!employeePackageDetails) {
            return { success: false };
        }

        const filtered = employeePackageDetails.map((doc: any) => {
            const obj = doc.toObject();
            obj.packages.forEach((pkg: any) => {
                pkg.tasks = pkg.tasks.map((taskObj: any) => {
                    if (taskObj && typeof taskObj === 'object') {
                        const { timesheet, ...rest } = taskObj;
                        return rest;
                    }
                    return taskObj;
                });
            });
            return obj;
        });

        return {
            success: true,
            employeePackageDetails: filtered
        };
    } catch (error) {
        console.error(`Error in fetching Employee Package details ${error}`);
        return { success: false };
    }
};

export default { getEmployeePackageDetailsByAdmin };
