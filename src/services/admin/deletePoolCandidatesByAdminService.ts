import TalentPoolCandidatesModel from '../../model/talentPoolCandidatesModel';

interface deletePoolCandidateResponse {
    success: boolean;
}

const hardDeletePoolCandidateByAdmin = async (poolCandidateIdToDelete: any): Promise<deletePoolCandidateResponse> => {
    return new Promise(async (resolve, reject) => {
        await TalentPoolCandidatesModel.deleteOne(
            { _id: poolCandidateIdToDelete })
            .then((responseAfterPoolCandidateHardDelete: any) => {
                resolve({ success: true });
            })
            .catch((error: any) => {
                console.error(`Error in hard deleting pool candidate: ${error}`);
                reject({ success: false });
            });
    });
}

const softDeletePoolCandidateByAdmin = async (poolCandidateIdToDelete: string): Promise<deletePoolCandidateResponse> => {
    return new Promise(async (resolve, reject) => {
        await TalentPoolCandidatesModel.updateOne(
            { _id: poolCandidateIdToDelete },
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
