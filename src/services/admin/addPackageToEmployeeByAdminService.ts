
import EmployeePackageModel from '../../model/employeePackageModel';


const addPackagetoEmployeeByAdmin = async (data: any): Promise<any> => {
    const { employeeId, packageId } = data;
    const existingPackage = await EmployeePackageModel.findOne({ employeeId, packageId });

    if (existingPackage) {
        return await EmployeePackageModel.findOneAndUpdate(
            { employeeId, packageId }, data,
            { new: true }
        );
    } else {
        const packagetoEmployeTData = new EmployeePackageModel(data);
        return await packagetoEmployeTData.save();
    }
}

export default { addPackagetoEmployeeByAdmin }
