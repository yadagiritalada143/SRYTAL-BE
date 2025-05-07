import PackagesModel from '../../model/packageModel';
import TaskModel from '../../model/taskModel';

interface FetchPackagesAndTasksResponse {
    success: boolean;
    packagesList?: any[];
}

const getAllPackagesWithTasksByAdmin = async (): Promise<FetchPackagesAndTasksResponse> => {
    try {
        const packagesList = await PackagesModel.find({ isDeleted: false })
            .populate('approvers', 'firstName lastName')
            .lean();

        if (!packagesList || packagesList.length === 0) {
            return { success: false, packagesList: [] };
        }

        const packageIds = packagesList.map((pkg) => pkg._id);

        const taskDetails = await TaskModel.find({
            packageId: { $in: packageIds },
            isDeleted: false
        })
            .populate('createdBy', 'firstName lastName')
            .lean();

        const tasksGroupedByPackage = taskDetails.reduce((acc, task) => {
            const packageIdKey = task.packageId?.toString();
            if (packageIdKey) {
                if (!acc[packageIdKey]) {
                    acc[packageIdKey] = [];
                }
                acc[packageIdKey].push(task);
            }
            return acc;
        }, {} as Record<string, any[]>);

        const packagesWithTasks = packagesList.map((pkg) => ({
            ...pkg,
            tasks: tasksGroupedByPackage[pkg._id.toString()] || []
        }));

        return {
            success: true,
            packagesList: packagesWithTasks
        };
    } catch (error) {
        console.error('Error in fetching all packages with tasks:', error);
        return { success: false };
    }
};

export default { getAllPackagesWithTasksByAdmin };
