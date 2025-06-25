import EmployeePackageModel from "../../model/employeePackageModel";

interface updateEmployeeTimesheetResponse {
    success: boolean;
    responseAfterUpdateTimesheet?: any;
}

const updateEmployeeTimesheet = async ( updatePayload: any): Promise<updateEmployeeTimesheetResponse> => {
 try {
        const result = await EmployeePackageModel.updateOne( { employeeId: updatePayload.employeeId}, { packages: updatePayload.packages});
        if (!result) {
            return { success: false };
        }
        
        return { success: true, responseAfterUpdateTimesheet: result };
    } catch (error: any) {
        console.error(`Error in updating employee timesheet: ${error}`);
        return { success: false, responseAfterUpdateTimesheet: error }
    }

}

export default { updateEmployeeTimesheet }
