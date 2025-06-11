import cron from 'node-cron';
import { ObjectId } from 'mongoose';
import EmployeePackageModel from '../model/employeePackageModel';

// Define Interfaces for TypeScript
interface ITimesheet {
  date: Date;
  isHoliday: boolean;
  isVacation: boolean;
  isWeekOff: boolean;
  hours: number;
  comments: string;
  leaveReason: string;
}

interface ITask {
  taskId: ObjectId;
  startDate: Date;
  timesheet: ITimesheet[];
}

interface IPackage {
  packageId: ObjectId;
  tasks: ITask[];
}

interface IEmployeePackage {
  employeeId: ObjectId;
  packages: IPackage[];
}

const updateNextMonthTimeSheet = async () => {
  try {
    // Calculate the first and last day of the next month
    const currentDate = new Date();
    const nextMonthFirstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      2 // First day of next month
    );
    console.log('nextMonthFirstDay is:', nextMonthFirstDay);

    const nextMonthLastDay = new Date(
      nextMonthFirstDay.getFullYear(),
      nextMonthFirstDay.getMonth() + 1,
      1 // Last day of next month (0 gives the last day of the previous month)
    );
    console.log('nextMonthLastDay is:', nextMonthLastDay);

    // Generate timesheet for the next month
    const daysInNextMonth = new Date(
      nextMonthFirstDay.getFullYear(),
      nextMonthFirstDay.getMonth() + 1, // Next month
      0 // Last day of the next month
    ).getDate(); // Total number of days in the next month
    console.log('daysInNextMonth is:', daysInNextMonth);
    const timesheet = Array.from({ length: daysInNextMonth }, (_, index) => {
      const currentDate = new Date(
        nextMonthFirstDay.getFullYear(),
        nextMonthFirstDay.getMonth(),
        index + 2 // Create individual dates for 1st to last day of next month
      );
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 1; // Check if it's a weekend (Sunday = 0, Saturday = 6)
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

    console.log('Generated timesheet for next month:', timesheet);

    // Fetch all Employee Packages and populate necessary paths
    const employeePackages = await EmployeePackageModel.find()
      .populate({
        path: 'packages.tasks.taskId', // Populate tasks inside packages
      })
      .lean() // Return plain JavaScript objects (not Mongoose Documents)
      .exec(); // Make the query return a promise

    console.log('employeePackages is:', employeePackages);
    // Now employeePackages is a plain structure matching your interfaces
    const employeePackagesTyped = employeePackages as unknown as IEmployeePackage[];
    console.log('employeePackagesTyped is:', employeePackagesTyped);
    // Update timesheet for all packages and tasks
    const updates = employeePackagesTyped.map(empPack => {
      empPack.packages.map(packageItem => {
        packageItem.tasks.map(task => {
          // Merge the newly generated timesheet into the task's existing timesheet
          console.log('I am at inside the tasks !!')
          const existingDates = new Set(task.timesheet.map(entry => entry.date.toISOString())); // Avoid duplicates
          console.log('existingDates is:', existingDates);
          console.log('Timesheet before update:', task.timesheet);
          timesheet.map(newEntry => {
            console.log('!existingDates.has(newEntry.date.toISOString()) is:', !existingDates.has(newEntry.date.toISOString()))
            if (!existingDates.has(newEntry.date.toISOString())) {
              task.timesheet.push(newEntry); // Add only if the date doesn't already exist
            }
            console.log('After every update:', task.timesheet);
          });
          console.log('timesheet after update is:', empPack.packages);
        });
      });

      console.log('empPack.employeeId is:', empPack.employeeId);
      console.log('empPack for update is:', empPack.packages[0].tasks[0].timesheet);
      // Use a database update operation to save the updated data
      return EmployeePackageModel.updateOne(
        { employeeId: empPack.employeeId }, // Find the corresponding employee package
        empPack // Save the updated structure back to MongoDB
      );
    });

    // Wait for all update operations to complete
    await Promise.all(updates);

    console.log("Timesheet updated for next month!");
  } catch (error) {
    console.error("Failed to update timesheets:", error);
    throw error;
  }
};

// Set up the cron job to run every minute for testing purposes
cron.schedule('*/10 * * * *', () => {
  console.log("Cron triggered! Running every 1 minute for testing...");
  updateNextMonthTimeSheet();
});

export default { updateNextMonthTimeSheet };