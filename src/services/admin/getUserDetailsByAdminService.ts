import UserModel from '../../model/userModel';

interface FetchUserResponse {
    success: boolean;
    userDetails?: any;
}

const formatDate = (date?: Date): string | null => {
    if (!date) return null;

    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const getEmployeeDetailsByAdmin = (id: string): Promise<FetchUserResponse> => {
    return new Promise((resolve, reject) => {
        UserModel.findOne({ _id: id })
            .populate('bloodGroup')
            .populate('employmentType')
            .populate('employeeRole')
            .populate('organization')
            .then((user: any) => {
                if (!user) {
                    reject({ success: false });
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
                            organization: user.organization,
                            employeeId: user.employeeId,
                            dateOfBirth: formatDate(user.dateOfBirth),
                            aadharNumber: user.aadharNumber,
                            panCardNumber: user.panCardNumber,
                            dateOfJoining: formatDate(user.dateOfJoining),
                            uanNumber: user.uanNumber,
                            presentAddress: user.presentAddress,
                            permanentAddress: user.permanentAddress
                        }
                    });
                }
            })
            .catch((error: any) => {
                console.error(`Error in fetching details: ${error}`);
                reject({ success: false });
            });
    });
}

export default { getEmployeeDetailsByAdmin };
