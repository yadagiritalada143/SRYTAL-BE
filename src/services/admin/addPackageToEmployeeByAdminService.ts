import EmployeePackageModel from '../../model/employeePackageModel';

const addPackagetoEmployeeByAdmin = async (data: any): Promise<any> => {
    const currentDay = new Date();
    const lastDayOfMonth = getLastDateOfMonth(currentDay);
    let timesheet = [];
    const startDay = currentDay.getDate();
    const endDay = lastDayOfMonth.getDate();
    const year = currentDay.getFullYear();
    const month = currentDay.getMonth();

    for (let day = startDay; day <= endDay; day++) {
        const currentDate = new Date(year, month, day + 1);
        const dayOfWeek = currentDate.getDay();
        let isWeekend = (dayOfWeek === 0 || dayOfWeek === 1);

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

function getLastDateOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export default { addPackagetoEmployeeByAdmin }
