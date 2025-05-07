
import EmployeePackageModel from '../../model/employeePackageModel';
import { IEmployeePackage } from '../../interfaces/employeepackages';

const addPackagetoEmployeeByAdmin = async (data: IEmployeePackage): Promise<any> => {
    const packagetoEmployeTData = new EmployeePackageModel(data);
    return await packagetoEmployeTData.save();
}

export default { addPackagetoEmployeeByAdmin }
