import EmployeePackageModel from '../../model/employeePackageModel';

const addPackagetoEmployeeByAdmin = async (data: any): Promise<any> => {

    // const currentDay = new Date();
    const currentDay = new Date('2024-02-02');
    console.log(currentDay);
    const lastDayOfMonth = getLastDateOfMonth(currentDay);
    console.log(lastDayOfMonth)
    let timesheet = [];

    for (
        let date = new Date(currentDay);
        date <= lastDayOfMonth;
        date.setDate(date.getDate() + 1)
    ) {
        const dateClone = new Date(date); 
        const dayOfWeek = dateClone.getDay();
        let isWeekend = false;
        if(dayOfWeek === 0 || dayOfWeek === 6){
            isWeekend = true;
        }

        timesheet.push({
            date: dateClone,
            isHoliday: false,
            isVacation: false,
            isWeekOff: isWeekend,
            hours: 0,
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
