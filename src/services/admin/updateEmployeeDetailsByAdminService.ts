import IUser from '../../interfaces/user';
import UserModel from '../../model/userModel';
import { UpdateProfileResponse } from '../../interfaces/user';

const updateEmployeeProfileByAdmin = async (userDetailsToUpdate: IUser): Promise<UpdateProfileResponse> => {
    try {
        await UserModel.updateOne(
            { email: userDetailsToUpdate.email },
            {
                firstName: userDetailsToUpdate.firstName,
                lastName: userDetailsToUpdate.lastName,
                mobileNumber: userDetailsToUpdate.mobileNumber,
                bloodGroup: userDetailsToUpdate.bloodGroup,
                bankDetailsInfo: userDetailsToUpdate.bankDetailsInfo,
                employmentType: userDetailsToUpdate.employmentType,
                employeeRole: userDetailsToUpdate.employeeRole,
                organization: userDetailsToUpdate.organization,
                employeeId: userDetailsToUpdate.employeeId,
                dateOfBirth: userDetailsToUpdate.dateOfBirth,
                aadharNumber: userDetailsToUpdate.aadharNumber,
                panCardNumber: userDetailsToUpdate.panCardNumber,
                presentAddress: userDetailsToUpdate.presentAddress,
                permanentAddress: userDetailsToUpdate.permanentAddress,
            });

        return { success: true };
    } catch (error) {
        console.error(`Error in updating Profile: ${error}`);
        throw error;
    }
};

export default { updateEmployeeProfileByAdmin };
