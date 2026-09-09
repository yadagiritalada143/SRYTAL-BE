"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const employeePackageModel_1 = __importDefault(require("../../model/employeePackageModel"));
const updateEmployeeTimesheet = async (updateEmployeeTimesheetPayload) => {
    try {
        const { employeeId, packages } = updateEmployeeTimesheetPayload;
        const employeePackage = await employeePackageModel_1.default.findOne({
            employeeId: employeeId
        });
        if (!employeePackage) {
            return {
                success: false,
                message: "Employee timesheet not found"
            };
        }
        const updateOperations = {};
        let hasUpdates = false;
        packages.forEach((payloadPackage) => {
            const packageIndex = employeePackage.packages.findIndex((dbPackage) => dbPackage.packageId.toString() === payloadPackage.packageId.toString());
            if (packageIndex === -1)
                return;
            payloadPackage.tasks.forEach((payloadTask) => {
                const taskIndex = employeePackage.packages[packageIndex].tasks.findIndex((dbTask) => dbTask.taskId.toString() === payloadTask.taskId.toString());
                if (taskIndex === -1)
                    return;
                payloadTask.timesheet.forEach((payloadTimesheet) => {
                    const timesheetIndex = employeePackage.packages[packageIndex].tasks[taskIndex].timesheet.findIndex((dbTimesheet) => areDatesEqual(dbTimesheet.date, payloadTimesheet.date));
                    if (timesheetIndex === -1)
                        return;
                    const basePath = `packages.${packageIndex}.tasks.${taskIndex}.timesheet.${timesheetIndex}`;
                    Object.entries(payloadTimesheet)
                        .filter(([key]) => key !== '_id' && key !== 'date')
                        .forEach(([key, value]) => {
                        updateOperations[`${basePath}.${key}`] = value;
                        hasUpdates = true;
                    });
                });
            });
        });
        if (hasUpdates) {
            const result = await employeePackageModel_1.default.updateOne({ employeeId: employeeId }, { $set: updateOperations });
            return {
                success: true,
                responseAfterUpdateTimesheet: result
            };
        }
        else {
            return {
                success: false,
                message: "No valid updates found in payload"
            };
        }
    }
    catch (error) {
        console.error(`Error in updating employee timesheet: ${error}`);
        return {
            success: false,
            responseAfterUpdateTimesheet: error,
            message: error.message
        };
    }
};
const areDatesEqual = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const returnVal = (d1.getUTCFullYear() === d2.getUTCFullYear() &&
        d1.getUTCMonth() === d2.getUTCMonth() &&
        d1.getUTCDate() === d2.getUTCDate());
    return returnVal;
};
exports.default = { updateEmployeeTimesheet };
