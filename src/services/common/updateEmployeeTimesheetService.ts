import EmployeePackageModel from "../../model/employeePackageModel";
import {
    IPackage,
    ITask,
    ITimesheet,
    UpdateEmployeeTimesheetResponse,
    TimesheetUpdate,
    TaskUpdate,
    PackageUpdate,
    UpdateTimesheetPayload
} from '../../interfaces/employeepackages';

const updateEmployeeTimesheet = async (updateEmployeeTimesheetPayload: UpdateTimesheetPayload): Promise<UpdateEmployeeTimesheetResponse> => {
    try {
        const { employeeId, packages } = updateEmployeeTimesheetPayload;

        const employeePackage = await EmployeePackageModel.findOne({
            employeeId: employeeId
        });

        if (!employeePackage) {
            return {
                success: false,
                message: "Employee timesheet not found"
            };
        }

        const updateOperations: Record<string, any> = {};
        let hasUpdates = false;

        packages.forEach((payloadPackage: PackageUpdate) => {
            const packageIndex = employeePackage.packages.findIndex(
                (dbPackage: IPackage) => dbPackage.packageId.toString() === payloadPackage.packageId.toString()
            );

            if (packageIndex === -1) return;

            payloadPackage.tasks.forEach((payloadTask: TaskUpdate) => {
                const taskIndex = employeePackage.packages[packageIndex].tasks.findIndex(
                    (dbTask: ITask) => dbTask.taskId.toString() === payloadTask.taskId.toString()
                );

                if (taskIndex === -1) return;

                payloadTask.timesheet.forEach((payloadTimesheet: TimesheetUpdate) => {
                    const timesheetIndex = employeePackage.packages[packageIndex].tasks[taskIndex].timesheet.findIndex(
                        (dbTimesheet: ITimesheet) => new Date(dbTimesheet.date).toISOString() === new Date(payloadTimesheet.date).toISOString()
                    );

                    if (timesheetIndex === -1) return;

                    const basePath = `packages.${packageIndex}.tasks.${taskIndex}.timesheet.${timesheetIndex}`;

                    Object.entries(payloadTimesheet)
                        .filter(([key]) => key !== '_id' && key !== 'date')
                        .forEach(([key, value]) => {
                            updateOperations[`${basePath}.${key}`] = value;
                            hasUpdates = true;
                        });
                });
            });
        });

        if (hasUpdates) {
            const result = await EmployeePackageModel.updateOne(
                { employeeId: employeeId },
                { $set: updateOperations }
            );

            return {
                success: true,
                responseAfterUpdateTimesheet: result
            };
        } else {
            return {
                success: false,
                message: "No valid updates found in payload"
            };
        }
    } catch (error: any) {
        console.error(`Error in updating employee timesheet: ${error}`);
        return {
            success: false,
            responseAfterUpdateTimesheet: error,
            message: error.message
        };
    }
};

export default { updateEmployeeTimesheet };