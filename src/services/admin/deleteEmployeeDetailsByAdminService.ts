import UserModel from '../../model/userModel';

interface deleteProfileResponse {
    success: boolean;
}

const hardDeleteEmployeeProfileByAdmin = async (userIdToDelete: any): Promise<deleteProfileResponse> => {
    return new Promise(async (resolve, reject) => {
        const result = await UserModel.deleteOne(
            { _id: userIdToDelete })
            .then((responseAfterProfileHardDelete: any) => {
                resolve({ success: true });
            })
            .catch((error: any) => {
                console.error('Error in hard deleting Profile:', error);
                reject({ success: false });
            });
    });
}

const softDeleteEmployeeProfileByAdmin = async (userIdToDelete: string): Promise<deleteProfileResponse> => {
    return new Promise(async (resolve, reject) => {
        const result = await UserModel.updateOne(
            { _id: userIdToDelete },
            { isDeleted: true })
            .then((responseAfterProfileSoftDelete: any) => {
                resolve({ success: true });
            })
            .catch((error: any) => {
                console.error('Error in soft deleting Profile:', error);
                reject({ success: false });
            });
    });
}

export default { hardDeleteEmployeeProfileByAdmin, softDeleteEmployeeProfileByAdmin };
