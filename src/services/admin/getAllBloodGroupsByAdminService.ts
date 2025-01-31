import UserModel from '../../model/userModel';

interface FetchBloodGroupDetailsResponse {
    success: boolean;
    usersList?: any;
}

const getAllBloodGroupsByAdmin = (organizationId: string, userId: string): Promise<FetchBloodGroupDetailsResponse> => {

    console.log('User ID passed is:', userId);

    return new Promise((resolve, reject) => {
        UserModel.find({
            organization: organizationId,
            _id: { $ne: userId } // Exclude the user with the provided userId
        })
            .populate('bloodGroup')
            // .populate('employmentType')
            // .populate('employeeRole')
            // .populate('organization')
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
                console.error('Error in fetching Blood Group details:', error);
                reject({ success: false });
            });
    });
};

export default { getAllBloodGroupsByAdmin }

