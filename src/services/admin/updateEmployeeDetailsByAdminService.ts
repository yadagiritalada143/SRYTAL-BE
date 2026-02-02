import IUser from '../../interfaces/user';
import UserModel from '../../model/userModel';

interface UpdateProfileResponse {
    success: boolean;
}

const updateEmployeeProfileByAdmin = async (userDetailsToUpdate: IUser): Promise<UpdateProfileResponse> => {
    return new Promise(async (resolve, reject) => {
        const result = await UserModel.updateOne(
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
                presentAddress: userDetailsToUpdate.presentAddress,
                permanentAddress: userDetailsToUpdate.permanentAddress
            })
            .then((responseAfterUpdateProfile: any) => {
                resolve({
                    success: true
                });
            })
            .catch((error: any) => {
                console.error(`Error in updating Profile: ${error}`);
                reject({ success: false });
            });

    });
}

export default { updateEmployeeProfileByAdmin };