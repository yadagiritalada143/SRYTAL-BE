"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const employeePackageModel_1 = __importDefault(require("../model/employeePackageModel"));
const updateNextMonthTimeSheet = async () => {
    try {
        const currentDate = new Date();
        const nextMonthFirstDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 2);
        const daysInNextMonth = new Date(nextMonthFirstDay.getFullYear(), nextMonthFirstDay.getMonth() + 1, 0).getDate();
        const timesheet = Array.from({ length: daysInNextMonth }, (_, index) => {
            const currentDate = new Date(nextMonthFirstDay.getFullYear(), nextMonthFirstDay.getMonth(), index + 1);
            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 1;
            return {
                date: currentDate,
                isHoliday: false,
                isVacation: false,
                isWeekOff: isWeekend,
                hours: 0,
                comments: '',
                leaveReason: '',
                status: 'NOT SUBMITTED'
            };
        });
        const employeePackages = await employeePackageModel_1.default.find()
            .populate({
            path: 'packages.tasks.taskId',
        })
            .lean()
            .exec();
        const employeePackagesTyped = employeePackages;
        const updates = employeePackagesTyped.map(empPack => {
            empPack.packages.map(packageItem => {
                packageItem.tasks.map(task => {
                    const existingDates = new Set(task.timesheet.map(entry => entry.date.toISOString()));
                    timesheet.map(newEntry => {
                        if (!existingDates.has(newEntry.date.toISOString())) {
                            task.timesheet.push(newEntry);
                        }
                    });
                });
            });
            return employeePackageModel_1.default.updateOne({ employeeId: empPack.employeeId }, empPack);
        });
        await Promise.all(updates);
    }
    catch (error) {
        console.error("Failed to update timesheets:", error);
        throw error;
    }
};
node_cron_1.default.schedule('0 0 25 * *', () => {
    console.log("Cron triggered! Running on the 25th of each month...");
    updateNextMonthTimeSheet();
});
exports.default = { updateNextMonthTimeSheet };
