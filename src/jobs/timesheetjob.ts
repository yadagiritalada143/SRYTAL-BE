import cron from 'node-cron';
import EmployeePackageModel from '../model/employeePackageModel';

 const updateNextMonthTimeSheet = async () => {
  const currentDay = new Date();
  const nextMonth = new Date(currentDay.getFullYear(), currentDay.getMonth() + 1, 2);
  const nextMonthFirstDay = new Date(nextMonth);
  const nextMonthLastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 1);
  let timesheet: any[] = [];

  for (
    let date = new Date(nextMonthFirstDay);
    date <= nextMonthLastDay;
    date.setDate(date.getDate() + 1)
  ) {
    const currentDate = new Date(date);
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 1;
    timesheet.push({
      date: currentDate.toISOString().split('T')[0],
      isHoliday: false,
      isVacation: false,
      isWeekOff: isWeekend,
      hours: 0,
      comments: '',
      leaveReason: ''
    });
  }

  try {
    const employeePackages = await EmployeePackageModel.find();
    for (const empPack of employeePackages) {
       for (const packages of empPack.packages) {
        const plainPackages = JSON.parse(JSON.stringify(packages));
        const tasks = plainPackages.tasks;
         for(const task of tasks) {
              task.timesheet = timesheet;  
         }
       }
       await empPack.save();
    }

    console.log(" Timesheet updated for next month:", nextMonthFirstDay.toISOString().split('T')[0]);
  } catch (error) {
    console.error(" Failed to update timesheets:", error);
  }
};

cron.schedule('*/2 * * * *', () => {
  console.log(" Cron triggered cron...");
  updateNextMonthTimeSheet();
});

export default {updateNextMonthTimeSheet}
