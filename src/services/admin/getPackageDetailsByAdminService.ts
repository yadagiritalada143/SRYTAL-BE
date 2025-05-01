import { AnyARecord } from 'node:dns';
import PackagesModel from '../../model/packageModel';
import TaskModel from '../../model/taskModel';

interface FetchPackagesDetailsResponse {
    success: boolean;
    packageDetails?: any;
}

const getPackageDetailsByAdmin = async (id: string): Promise<FetchPackagesDetailsResponse> => {
    try {
        const packageDoc = await PackagesModel.findById(id)
            .populate('approvers', 'firstName lastName');

        if (!packageDoc) {
            return { success: false };
        }

        const taskDetails = await TaskModel.find({ packageId: id });

        const packageDetails = packageDoc.toObject() as any;
        packageDetails.tasks = taskDetails;

        return {
            success: true,
            packageDetails
        };
    } catch (error) {
        console.error('Error in fetching Package details:', error);
        return { success: false };
    }
};

export default { getPackageDetailsByAdmin };
