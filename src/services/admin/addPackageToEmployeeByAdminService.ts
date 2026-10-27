import EmployeePackageModel from '../../model/employeePackageModel';
import { ITimesheet } from '../../interfaces/employeepackages';


const addPackagetoEmployeeByAdmin = async (data: any): Promise<any> => {
    const currentDay = new Date();
    const lastDayToGenerate = new Date(
        currentDay.getFullYear(),
        currentDay.getMonth() + 2,
        0
    );
    const timesheet: ITimesheet[] = [];


    for (
        let date = new Date(
            currentDay.getFullYear(),
            currentDay.getMonth(),
            currentDay.getDate()
        );
        date <= lastDayToGenerate;
        date.setDate(date.getDate() + 1)
    ) {
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
        data.packages.forEach((pkg: any) => {
            if (pkg.tasks && Array.isArray(pkg.tasks)) {
                pkg.tasks.forEach((task: any) => {
                    task.timesheet = timesheet;
                });
            }
        });
    }


    const { employeeId, packageId } = data;
    const existingPackage = await EmployeePackageModel.findOne({ employeeId, packageId });


    if (existingPackage) {
        return await EmployeePackageModel.findOneAndUpdate(
            { employeeId, packageId }, data,
            { new: true }
        );
    } else {
        const packagetoEmployeTData = new EmployeePackageModel(data);
        return await packagetoEmployeTData.save();
    }
}


export default { addPackagetoEmployeeByAdmin }

