import PackagesModel from '../../model/packageModel';

interface FetchPackagesDetailsResponse {
    success: boolean;
    packagesList?: any;
}

const getAllPackagesByAdmin = (): Promise<FetchPackagesDetailsResponse> => {
    return new Promise((resolve, reject) => {
        PackagesModel.find({ isDeleted: false })
            .then((packagesList: any) => {
                if (!packagesList) {
                    reject({ success: false });
                } else {
                    resolve({
                        success: true,
                        packagesList: packagesList
                    });
                }
            })
            .catch((error: any) => {
                console.error('Error in fetching Pacakges details:', error);
                reject({ success: false });
            });
    });
};

export default { getAllPackagesByAdmin }
