"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const employeePackageModel_1 = __importDefault(require("../../model/employeePackageModel"));
const deleteEmployeePackageServiceByAdmin = async (employeeId, packageId) => {
    try {
        const employeePackageDoc = await employeePackageModel_1.default.findOne({ employeeId });
        if (!employeePackageDoc) {
            return { success: false, responseAfterDelete: 'Employee package not found !' };
        }
        const packageToDelete = employeePackageDoc.packages.find((pkg) => pkg.packageId.toString() === packageId);
        if (!packageToDelete) {
            return { success: false, responseAfterDelete: 'Package not found for employee !' };
        }
        employeePackageDoc.packages = employeePackageDoc.packages.filter((pkg) => pkg.packageId.toString() !== packageId);
        let updatedDoc;
        if (employeePackageDoc.packages.length) {
            updatedDoc = await employeePackageDoc.save();
        }
        else {
            updatedDoc = await employeePackageModel_1.default.deleteOne({ _id: employeePackageDoc._id });
        }
        return { success: true, responseAfterDelete: updatedDoc };
    }
    catch (error) {
        console.error(`Error in deleting employee package and its tasks: ${error}`);
        return { success: false };
    }
};
exports.default = { deleteEmployeePackageServiceByAdmin };
