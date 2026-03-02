import UserModel from '../../model/userModel';
import { FetchEmployeeDetailsResponse } from '../../interfaces/user';

const formatDate = (date?: Date): string | null => {
    if (!date) return null;

    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};
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
            usersList: users.map((user: any) => ({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                mobileNumber: user.mobileNumber,
                bloodGroup: user.bloodGroup,
                bankDetailsInfo: user.bankDetailsInfo,
                employmentType: user.employmentType,
                employeeRole: user.employeeRole,
                organization: user.organization,
                employeeId: user.employeeId,
                dateOfBirth: formatDate(user.dateOfBirth),
                aadharNumber: user.aadharNumber,
                panCardNumber: user.panCardNumber,
                dateOfJoining: formatDate(user.dateOfJoining),
                presentAddress: user.presentAddress,
                permanentAddress: user.permanentAddress
            }))
        };
    } catch (error) {
        console.error(`Error in fetching Employee details: ${error}`);
        throw { success: false };
    }
};

export default { getAllEmployeeDetailsByAdmin }

