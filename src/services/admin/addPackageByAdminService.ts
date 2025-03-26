
import PackagesModel from '../../model/packageModel';
import { IPackage } from '../../interfaces/package';

const addPackageByAdmin = async (data: IPackage): Promise<any> => {
    console.log('data came to save is:', data)
    const packageData = new PackagesModel(data);
    return await packageData.save();
}

export default { addPackageByAdmin }
