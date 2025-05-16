
import cron from 'node-cron';
import EmployeePackageModel from '../model/employeePackageModel';

const start = () => {
  console.log('SchedulerService: Starting the scheduler...');
  cron.schedule('*/5 * * * * *', async () => {
    try {
      const getLastDayOfCurrentMonth = (): Date => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        return new Date(year, month + 1, 0);
      };

      const getAllDatesOfCurrentMonth = (): Date[] => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();

        const dates: Date[] = [];
        for (let day = 1; day <= lastDay; day++) {
          dates.push(new Date(year, month, day));
        }

        return dates;
      };

      const getWeekOffsInMonth = (): string[] => {
        const allDates = getAllDatesOfCurrentMonth();

        const weekOffs = allDates
          .filter(date => date.getDay() === 1)
          .map(date => date.toISOString().split('T')[0]);

        return weekOffs;
      };

      const allPackages = await EmployeePackageModel.find({});
      const lastDayOfMonth = getLastDayOfCurrentMonth();
      const currentMonthWeekOffs = getWeekOffsInMonth();

      const result = allPackages.map(pkg => ({
        employeeId: pkg.employeeId,
        packages: pkg.packages,
        startDate: pkg.startDate,
        createdAt: pkg.createdAt,
        currentMonthLastDay: lastDayOfMonth.toDateString(),
        weekOffs: currentMonthWeekOffs
      }));

      console.log('Employee Packages with Week Offs:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });
}

export default { start };
