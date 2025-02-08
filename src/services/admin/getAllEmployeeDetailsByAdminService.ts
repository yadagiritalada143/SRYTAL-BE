import UserModel from '../../model/userModel';

interface FetchEmployeeDetailsResponse {
    success: boolean;
    usersList?: any;
}

const getAllEmployeeDetailsByAdmin = (organizationId: string, userId: string): Promise<FetchEmployeeDetailsResponse> => {

    return new Promise((resolve, reject) => {
        UserModel.find({
            organization: organizationId,
            _id: { $ne: userId }, // Exclude the user with the provided userId
            isDeleted: false
        })
            .populate('bloodGroup')
            .populate('employmentType')
            .populate('employeeRole')
            .populate('organization')
            .then((users: any) => {
                if (!users) {
                    reject({ success: false });
                } else {
                    resolve({
                        success: true,
                        usersList: users
                    });
                }
            })
            .catch((error: any) => {
                console.error('Error in fetching Employee details:', error);
                reject({ success: false });
            });
    });
};

export default { getAllEmployeeDetailsByAdmin }

