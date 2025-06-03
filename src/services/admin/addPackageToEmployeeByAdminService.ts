
import EmployeePackageModel from '../../model/employeePackageModel';
import { IEmployeePackage } from '../../interfaces/employeepackages';


const addPackagetoEmployeeByAdmin = async (data: IEmployeePackage): Promise<any> => {
    const {employeeId, packageId } = data;
    const existingPackage = await EmployeePackageModel.findOne({ employeeId, packageId });

    if(existingPackage) {
        return await EmployeePackageModel.findOneAndUpdate(
            {employeeId, packageId }, data,
            {new: true}
        );
    }else{
          const packagetoEmployeTData = new EmployeePackageModel(data);
    return await packagetoEmployeTData.save();        

    }
  
}

export default { addPackagetoEmployeeByAdmin }
