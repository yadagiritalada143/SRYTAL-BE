import UserModel from '../../model/userModel';
import { FetchEmployeeDetailsResponse } from '../../interfaces/user';

const getAllEmployeeDetailsByAdmin = async (organizationId: string, userId: string): Promise<FetchEmployeeDetailsResponse> => {
    try {
        const users = await UserModel.find({
            organization: organizationId,
            _id: { $ne: userId }, // Exclude the user with the provided userId
            isDeleted: false
        })
            .populate('bloodGroup')
            .populate('employmentType')
            .populate('employeeRole')
            .populate('organization');

        if (!users) {
            return { success: false };
        }

        return {
            success: true,
            usersList: users
        };
    } catch (error) {
        console.error(`Error in fetching Employee details: ${error}`);
        throw { success: false };
    }
};

export default { getAllEmployeeDetailsByAdmin }

