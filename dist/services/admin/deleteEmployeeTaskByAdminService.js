"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const employeePackageModel_1 = __importDefault(require("../../model/employeePackageModel"));
const deleteEmployeeTaskServiceByAdmin = async (employeeId, packageId, taskId) => {
    try {
        const employeePackageDoc = await employeePackageModel_1.default.findOne({ employeeId });
        if (!employeePackageDoc) {
            return { success: false, responseAfterDelete: 'Employee package not found!' };
        }
        const packageToUpdate = employeePackageDoc.packages.find((pkg) => pkg.packageId.toString() === packageId);
        if (!packageToUpdate) {
            return { success: false, responseAfterDelete: 'Package not found for employee!' };
        }
        const taskIndex = packageToUpdate.tasks.findIndex((task) => task.taskId.toString() === taskId);
        if (taskIndex === -1) {
            return { success: false, responseAfterDelete: 'Task not found in the package!' };
        }
        packageToUpdate.tasks.splice(taskIndex, 1);
        const updatedDoc = await employeePackageModel_1.default.findOneAndUpdate({
            employeeId,
            'packages.packageId': packageId
        }, {
            $set: {
                'packages.$.tasks': packageToUpdate.tasks
            }
        }, { new: true });
        return {
            success: true,
            responseAfterDelete: updatedDoc
        };
    }
    catch (error) {
        console.error(`Error in deleting employee task: ${error}`);
        return { success: false };
    }
};
exports.default = { deleteEmployeeTaskServiceByAdmin };
