import { Request, Response } from 'express';
import updateEmployeeTimesheetService from '../../services/common/updateEmployeeTimesheetService';
import { UPDATE_EMPLOYEE_TIMESHEET_ERRORS_MESSAGES } from '../../constants/common/employeeTimesheetErrorMessage';

const updateEmployeeTimesheetController = (req: Request, res: Response) => {
    const { userId } = req.body;
    let updateEmployeeTimeSheetPayload: any = {};

    let employeeIdToUpdateTimeSheet = '';
    if (req.body && req.body.employeeId) {
        employeeIdToUpdateTimeSheet = req.body.employeeId;
    } else {
        employeeIdToUpdateTimeSheet = userId;
    }

    updateEmployeeTimeSheetPayload.packages = req.body.packages;
    updateEmployeeTimeSheetPayload.employeeId = employeeIdToUpdateTimeSheet;
    updateEmployeeTimesheetService
        .updateEmployeeTimesheet(updateEmployeeTimeSheetPayload)
        .then((updateEmployeeTimesheetResponse: any) => {
            res.status(200).json(updateEmployeeTimesheetResponse);
        })
        .catch((error: any) => {
            console.error(`Error in updating employee timesheet: ${error}`);
            res.status(500).json({ success: false, message: UPDATE_EMPLOYEE_TIMESHEET_ERRORS_MESSAGES.EMPLOYEE_TIMESHEET_UPDATING_ERROR_MESSAGE });
        });
}

export default { updateEmployeeTimesheetController }
