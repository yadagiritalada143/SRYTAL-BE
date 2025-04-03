import PackagesModel from '../../model/packageModel';

interface deletePackageResponse {
    success: boolean;
}

const hardDeletePackageServiceByAdmin = async (packageIdToDelete: any): Promise<deletePackageResponse> => {
    return new Promise(async (resolve, reject) => {
        await PackagesModel.deleteOne(
            { _id: packageIdToDelete })
            .then((responseAfterHardDeletingPackage: any) => {
                resolve({ success: true });
            })
            .catch((error: any) => {
                console.error(`Error in hard deleting package: ${error}`);
                reject({ success: false });
            });
    });
}

const softDeletePackageServiceByAdmin = async (packageIdToDelete: string): Promise<deletePackageResponse> => {
    return new Promise(async (resolve, reject) => {
        await PackagesModel.updateOne(
            { _id: packageIdToDelete },
            { isDeleted: true })
            .then((responseAfterSoftDeletingPackage: any) => {
                resolve({ success: true });
            })
            .catch((error: any) => {
                console.error(`Error in soft deleting package: ${error}`);
                reject({ success: false });
            });
    });
}

export default { hardDeletePackageServiceByAdmin, softDeletePackageServiceByAdmin };
