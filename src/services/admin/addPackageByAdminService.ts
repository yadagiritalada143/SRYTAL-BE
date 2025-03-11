
import PackagesModel from '../../model/packageModel';
import {IPackage} from '../../interfaces/package'

const addPackageByAdmin = async (data: IPackage): Promise<any> => {
    const packageData = new PackagesModel(data);
    return await packageData.save();
}
export default {addPackageByAdmin}
