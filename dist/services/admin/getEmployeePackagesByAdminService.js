"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const employeePackageModel_1 = __importDefault(require("../../model/employeePackageModel"));
const getEmployeePackageDetailsByAdmin = async (employeeId) => {
    try {
        const employeePackageDetails = await employeePackageModel_1.default.find({ employeeId })
            .populate('packages.packageId')
            .populate({
            path: 'packages.tasks.taskId',
            select: '-timesheet'
        });
        if (!employeePackageDetails) {
            return { success: false };
        }
        const filtered = employeePackageDetails.map((doc) => {
            const obj = doc.toObject();
            obj.packages.forEach((pkg) => {
                pkg.tasks = pkg.tasks.map((taskObj) => {
                    if (taskObj && typeof taskObj === 'object') {
                        const { timesheet } = taskObj, rest = __rest(taskObj, ["timesheet"]);
                        return rest;
                    }
                    return taskObj;
                });
            });
            return obj;
        });
        return {
            success: true,
            employeePackageDetails: filtered
        };
    }
    catch (error) {
        console.error(`Error in fetching Employee Package details ${error}`);
        return { success: false };
    }
};
exports.default = { getEmployeePackageDetailsByAdmin };
