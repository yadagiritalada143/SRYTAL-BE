import PoolCompaniesModel from '../../model/poolCompanies';

interface deletePoolCompanyResponse {
    success: boolean;
}

const hardDeletePoolCompanyByAdmin = async (poolCompanyIdToDelete: any): Promise<deletePoolCompanyResponse> => {
    return new Promise(async (resolve, reject) => {
        await PoolCompaniesModel.deleteOne(
            { _id: poolCompanyIdToDelete })
            .then((responseAfterPoolCandidateHardDelete: any) => {
                resolve({ success: true });
            })
            .catch((error: any) => {
                console.error(`Error in hard deleting pool company: ${error}`);
                reject({ success: false });
            });
    });
}

const softDeletePoolCompanyByAdmin = async (poolCompanyIdToDelete: string): Promise<deletePoolCompanyResponse> => {
    return new Promise(async (resolve, reject) => {
        await PoolCompaniesModel.updateOne(
            { _id: poolCompanyIdToDelete },
            { isDeleted: true })
            .then((responseAfterPoolCandidateSoftDelete: any) => {
                resolve({ success: true });
            })
            .catch((error: any) => {
                console.error(`Error in soft deleting pool company: ${error}`);
                reject({ success: false });
            });
    });
}

export default { hardDeletePoolCompanyByAdmin, softDeletePoolCompanyByAdmin };
