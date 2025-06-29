"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateEmployeeTimesheetService_1 = __importDefault(require("../../services/common/updateEmployeeTimesheetService"));
const employeeTimesheetErrorMessage_1 = require("../../constants/common/employeeTimesheetErrorMessage");
const updateEmployeeTimesheetController = (req, res) => {
    const { userId } = req.body;
    let updateEmployeeTimeSheetPayload = {};
    updateEmployeeTimeSheetPayload.packages = req.body.packages;
    updateEmployeeTimeSheetPayload.employeeId = userId;
    updateEmployeeTimesheetService_1.default
        .updateEmployeeTimesheet(updateEmployeeTimeSheetPayload)
        .then((updateEmployeeTimesheetResponse) => {
        res.status(200).json(updateEmployeeTimesheetResponse);
    })
        .catch((error) => {
        console.error(`Error in updating employee timesheet: ${error}`);
        res.status(500).json({ success: false, message: employeeTimesheetErrorMessage_1.UPDATE_EMPLOYEE_TIMESHEET_ERRORS_MESSAGES.EMPLOYEE_TIMESHEET_UPDATING_ERROR_MESSAGE });
    });
};
exports.default = { updateEmployeeTimesheetController };
