"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const employeePackageModel_1 = __importDefault(require("../../model/employeePackageModel"));
const employeePackageDetailsById = async (employeeId, startDate, endDate) => {
    try {
        const employeePackageDetails = await employeePackageModel_1.default.find({ employeeId })
            .populate('packages.packageId')
            .populate('packages.tasks.taskId')
            .lean();
        if (!employeePackageDetails) {
            return { success: false };
        }
        const filteredData = employeePackageDetails.map(empPkg => {
            const filteredPackages = empPkg.packages.map(pkg => {
                const filteredTasks = pkg.tasks.map(task => {
                    const startDateObj = new Date(startDate);
                    const endDateObj = new Date(endDate);
                    endDateObj.setDate(endDateObj.getDate() + 1);
                    const filteredTimesheet = task.timesheet.filter((ts) => {
                        const tsDate = new Date(ts.date);
                        return tsDate >= startDateObj && tsDate < endDateObj;
                    });
                    return Object.assign(Object.assign({}, task), { timesheet: filteredTimesheet });
                });
                return Object.assign(Object.assign({}, pkg), { tasks: filteredTasks });
            });
            return Object.assign(Object.assign({}, empPkg), { packages: filteredPackages });
        });
        return {
            success: true,
            employeePackageDetails: filteredData
        };
    }
    catch (error) {
        console.error(`Error in fetching Employee Package details by ID: ${error}`);
        return { success: false };
    }
};
exports.default = { employeePackageDetailsById };
