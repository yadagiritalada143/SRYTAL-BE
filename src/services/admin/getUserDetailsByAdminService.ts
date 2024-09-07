import UserModel from '../../model/userModel';

interface FetchUserResponse {
    success: boolean;
    userDetails?: any;
}

const getEmployeeDetailsByAdmin = (email: string): Promise<FetchUserResponse> => {
    return new Promise((resolve, reject) => {
        UserModel.findOne({ email })
            .populate('bloodGroup')
            .populate('employmentType')
            .populate('employeeRole')
            .populate('organization')
            .then((user: any) => {
                if (!user) {
                    resolve({ success: false });
                } else {
                    resolve({
                        success: true,
                        userDetails: {
                            id: user.id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            mobileNumber: user.mobileNumber,
                            bloodGroup: user.bloodGroup,
                            bankDetailsInfo: user.bankDetailsInfo,
                            employmentType: user.employmentType,
                            employeeRole: user.employeeRole,
                            organization: user.organization
                        }
                    });
                }
            })
            .catch((error: any) => {
                console.error('Error in fetching details:', error);
                reject({ success: false });
            });
    });
}

export default { getEmployeeDetailsByAdmin };