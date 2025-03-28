import PackagesModel from '../../model/packageModel';

interface FetchPackagesDetailsResponse {
    success: boolean;
    pacakgesList?: any;
}

const getAllPackagesByAdmin = (): Promise<FetchPackagesDetailsResponse> => {
    return new Promise((resolve, reject) => {
        PackagesModel.find({})
            .populate({
                path: 'tasks',
                populate: {
                    path: 'createdBy',
                    select: 'firstName lastName',
                },
            })
            .populate('approvers', 'firstName lastName')
            .then((pacakgesList: any) => {
                if (!pacakgesList) {
                    reject({ success: false });
                } else {
                    resolve({
                        success: true,
                        pacakgesList: pacakgesList
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
