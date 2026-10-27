"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const employeePackageModel_1 = __importDefault(require("../../model/employeePackageModel"));
const addPackagetoEmployeeByAdmin = async (data) => {
    const currentDay = new Date();
    const lastDayToGenerate = new Date(currentDay.getFullYear(), currentDay.getMonth() + 2, 0);
    const timesheet = [];
    for (let date = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate()); date <= lastDayToGenerate; date.setDate(date.getDate() + 1)) {
        const currentDate = new Date(date);
        const dayOfWeek = currentDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        timesheet.push({
            date: currentDate,
            isHoliday: false,
            isVacation: false,
            isWeekOff: isWeekend,
            hours: 0,
            comments: '',
            leaveReason: '',
            status: 'NOT SUBMITTED'
        });
    }
    if (data.packages && Array.isArray(data.packages)) {
        data.packages.forEach((pkg) => {
            if (pkg.tasks && Array.isArray(pkg.tasks)) {
                pkg.tasks.forEach((task) => {
                    task.timesheet = timesheet;
                });
            }
        });
    }
    const { employeeId, packageId } = data;
    const existingPackage = await employeePackageModel_1.default.findOne({ employeeId, packageId });
    if (existingPackage) {
        return await employeePackageModel_1.default.findOneAndUpdate({ employeeId, packageId }, data, { new: true });
    }
    else {
        const packagetoEmployeTData = new employeePackageModel_1.default(data);
        return await packagetoEmployeTData.save();
    }
};
exports.default = { addPackagetoEmployeeByAdmin };
