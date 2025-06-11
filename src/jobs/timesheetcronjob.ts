import cron from 'node-cron';
import EmployeePackageModel from '../model/employeePackageModel';
import { ITimesheet, ITask, IPackage, IEmployeePackage } from '../interfaces/employeepackages';

const updateNextMonthTimeSheet = async () => {
  try {
    const currentDate = new Date();
    const nextMonthFirstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      2
    );

    const daysInNextMonth = new Date(
      nextMonthFirstDay.getFullYear(),
      nextMonthFirstDay.getMonth() + 1,
      0
    ).getDate();
    const timesheet = Array.from({ length: daysInNextMonth }, (_, index) => {
      const currentDate = new Date(
        nextMonthFirstDay.getFullYear(),
        nextMonthFirstDay.getMonth(),
        index + 2
      );
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 1;
      return {
        date: currentDate,
        isHoliday: false,
        isVacation: false,
        isWeekOff: isWeekend,
        hours: 0,
        comments: '',
        leaveReason: ''
      };
    });

    const employeePackages = await EmployeePackageModel.find()
      .populate({
        path: 'packages.tasks.taskId',
      })
      .lean()
      .exec();

    const employeePackagesTyped = employeePackages as unknown as IEmployeePackage[];
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

      return EmployeePackageModel.updateOne(
        { employeeId: empPack.employeeId },
        empPack
      );
    });

    await Promise.all(updates);

  } catch (error) {
    console.error("Failed to update timesheets:", error);
    throw error;
  }
};

// Set up the cron job to run 
// TODO: Change this to month last 
cron.schedule('*/10 * * * *', () => {
  console.log("Cron triggered! Running every 10 minutes for testing...");
  updateNextMonthTimeSheet();
});

export default { updateNextMonthTimeSheet };