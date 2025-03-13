import { any } from 'joi';
import PackagesModel from '../../model/packageModel'
import { IPackage } from '../../interfaces/package'

interface updatePackageResponse {
    success: boolean;
    responseAfterupdate?: any;
}

const updatePackageByAdmin = async (id: string, detailsToUpdate: IPackage): Promise<updatePackageResponse> => {
    try {
        const result = await PackagesModel.updateOne({ _id: id }, { ...detailsToUpdate });
        if (result) {
            return { success: true, responseAfterupdate: result };
        } else {
            return { success: false };
        }
    } catch (error: any) {
        console.error(`Error in updating packages: ${error}`)
        return { success: false, responseAfterupdate: error }
    }
}

export default { updatePackageByAdmin };
