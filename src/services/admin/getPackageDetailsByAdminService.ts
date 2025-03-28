import PackagesModel from '../../model/packageModel';

interface FetchPackagesDetailsResponse {
    success: boolean;
    packageDetails?: any;
}

const getPackageDetailsByAdmin = (id: string): Promise<FetchPackagesDetailsResponse> => {
    return new Promise((resolve, reject) => {
        PackagesModel.findById({ _id: id })
            .populate({
                path: 'tasks',
                populate: {
                    path: 'createdBy',
                    select: 'firstName lastName',
                },
            })
            .populate('approvers', 'firstName lastName')
            .then((packageDetails: any) => {
                if (!packageDetails) {
                    reject({ success: false });
                } else {
                    resolve({
                        success: true,
                        packageDetails: packageDetails
                    });
                }
            })
            .catch((error: any) => {
                console.error('Error in fetching Pacakge details:', error);
                reject({ success: false });
            });
    });
};

export default { getPackageDetailsByAdmin }
