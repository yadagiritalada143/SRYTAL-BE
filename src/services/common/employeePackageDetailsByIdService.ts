import EmployeePackageModel from '../../model/employeePackageModel';

interface FetchEmployeePackagesDetailsResponse {
    success: boolean;
    employeePackageDetails?: any;
}

const employeePackageDetailsById = async (
    employeeId: string,
    startDate: string,
    endDate: string
): Promise<FetchEmployeePackagesDetailsResponse> => {
    try {
        const employeePackageDetails = await EmployeePackageModel.find({ employeeId })
            .populate('packages.packageId')
            .populate('packages.tasks.taskId')
            .lean();

        if (!employeePackageDetails) {
            return { success: false };
        }

        const filteredData = employeePackageDetails.map(empPkg => {
            const filteredPackages = empPkg.packages.map(pkg => {
                const filteredTasks = pkg.tasks.map(task => {
                    const startDateObj = new Date(startDate);
                    const endDateObj = new Date(endDate);
                    endDateObj.setDate(endDateObj.getDate() + 1);
                    const filteredTimesheet = task.timesheet.filter((ts: any) => {
                        const tsDate = new Date(ts.date);
                        return tsDate >= startDateObj && tsDate < endDateObj;
                    });
                    return { ...task, timesheet: filteredTimesheet };
                });
                return { ...pkg, tasks: filteredTasks };
            });
            return { ...empPkg, packages: filteredPackages };
        });

        return {
            success: true,
            employeePackageDetails: filteredData
        };
    } catch (error) {
        console.error('Error in fetching Employee Package details by ID:', error);
        return { success: false };
    }
};

export default { employeePackageDetailsById };
