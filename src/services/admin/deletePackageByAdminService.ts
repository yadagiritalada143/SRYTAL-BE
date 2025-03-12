import PackageModel from '../../model/packageModel';

interface deletePackageResponse {
    success: boolean;
    responseAfterDelete?: any;
}

const deletePackageByAdmin = async (id: any): Promise<deletePackageResponse> => {
    try {
        const result = await PackageModel.findByIdAndDelete({ _id: id });
        if (result) {
            return { success: true, responseAfterDelete: result };
        } else {
            return { success: false };
        }
    } catch (error: any) {
        console.error('Error in  deleting package: ', error);
        return { success: false, responseAfterDelete: error }
    }
}

export default { deletePackageByAdmin };
