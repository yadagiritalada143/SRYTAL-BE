import EmployeePackageModel from '../../model/employeePackageModel';
import { ObjectId } from 'mongoose';

interface IEmployeePackage {
    employeeId: ObjectId;
    packages: {
        packageId: ObjectId;
        tasks: {
            taskId: ObjectId;
            startDate: Date;
        }[];
    }[];
}

interface DeleteEmployeePackagesResponse {
    success: boolean;
    responseAfterDelete?: any;
}

const deleteEmployeePackageServiceByAdmin = async (
    employeeId: string,
    packageId: string
): Promise<DeleteEmployeePackagesResponse> => {
    try {
        const employeePackageDoc = await EmployeePackageModel.findOne({ employeeId }) as IEmployeePackage
        if (!employeePackageDoc) {
            return { success: false, responseAfterDelete: 'Employee package not found !' };
        }

        const packageToDelete = employeePackageDoc.packages.find(
            (pkg) => pkg.packageId.toString() === packageId
        );
        if (!packageToDelete) {
            return { success: false, responseAfterDelete: 'Package not found for employee !' };
        }

        employeePackageDoc.packages = employeePackageDoc.packages.filter(
            (pkg: any) => pkg.packageId.toString() !== packageId
        );

        let updatedDoc;

        if (employeePackageDoc.packages.length) {
            updatedDoc = await (employeePackageDoc as any).save();
        } else {
            updatedDoc = await EmployeePackageModel.deleteOne({ _id: (employeePackageDoc as any)._id });
        }
        return { success: true, responseAfterDelete: updatedDoc };
    } catch (error: any) {
        console.error(`Error in deleting employee package and its tasks: ${error}`);
        return { success: false };
    }
};

export default { deleteEmployeePackageServiceByAdmin };
