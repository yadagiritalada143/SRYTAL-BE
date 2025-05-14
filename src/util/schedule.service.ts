
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
      const allPackages = await EmployeePackageModel.find({});

      const lastDayOfMonth = getLastDayOfCurrentMonth();

      const result = allPackages.map(pkg => ({
        employeeId: pkg.employeeId,
        packages: pkg.packages,
        startDate: pkg.startDate,
        createdAt: pkg.createdAt,
        currentMonthLastDay: lastDayOfMonth.toDateString(),

      }));

      console.log('Employee Packages with Last Day of Month:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });
}

export default { start };