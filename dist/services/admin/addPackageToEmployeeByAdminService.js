"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const employeePackageModel_1 = __importDefault(require("../../model/employeePackageModel"));
const addPackagetoEmployeeByAdmin = async (data) => {
    const currentDay = new Date();
    const lastDayOfMonth = getLastDateOfMonth(currentDay);
    let timesheet = [];
    const startDay = currentDay.getDate();
    const endDay = lastDayOfMonth.getDate();
    const year = currentDay.getFullYear();
    const month = currentDay.getMonth();
    for (let day = startDay; day <= endDay; day++) {
        const currentDate = new Date(year, month, day);
        const dayOfWeek = currentDate.getDay();
        let isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
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
function getLastDateOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
exports.default = { addPackagetoEmployeeByAdmin };
