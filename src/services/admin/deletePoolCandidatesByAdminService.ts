import UserModel from '../../model/userModel';

interface deletePoolCandidateResponse {
    success: boolean;
}

const hardDeletePoolCandidateByAdmin = async (userIdToDelete: any): Promise<deletePoolCandidateResponse> => {
    return new Promise(async (resolve, reject) => {
        const result = await UserModel.deleteOne(
            { _id: userIdToDelete })
            .then((responseAfterPoolCandidateHardDelete: any) => {
                resolve({ success: true });
            })
            .catch((error: any) => {
                console.error(`Error in hard deleting pool candidate: ${error}`);
                reject({ success: false });
            });
    });
}

const softDeletePoolCandidateByAdmin = async (userIdToDelete: string): Promise<deletePoolCandidateResponse> => {
    return new Promise(async (resolve, reject) => {
        const result = await UserModel.updateOne(
            { _id: userIdToDelete },
            { isDeleted: true })
            .then((responseAfterPoolCandidateSoftDelete: any) => {
                resolve({ success: true });
            })
            .catch((error: any) => {
                console.error(`Error in soft deleting pool candidate: ${error}`);
                reject({ success: false });
            });
    });
}

export default { hardDeletePoolCandidateByAdmin, softDeletePoolCandidateByAdmin };
