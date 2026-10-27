"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteEmployeeTaskByAdminService_1 = __importDefault(require("../../services/admin/deleteEmployeeTaskByAdminService"));
const employeePackageMessages_1 = require("../../constants/admin/employeePackageMessages");
const deleteEmployeeTaskByAdmin = (req, res) => {
    const { employeeId, packageId, taskId } = req.body;
    deleteEmployeeTaskByAdminService_1.default
        .deleteEmployeeTaskServiceByAdmin(employeeId, packageId, taskId)
        .then((deleteEmployeePackageResponse) => {
        res.status(200).json(deleteEmployeePackageResponse);
    })
        .catch((error) => {
        console.error(`Error in deleting employee packages: ${error}`);
        res.status(500).json({ success: false, message: employeePackageMessages_1.EMPLOYEE_TASK_ERROR_MESSAGE.EMPLOYEE_TASK_DELETE_ERROR_MESSAGE });
    });
};
exports.default = { deleteEmployeeTaskByAdmin };
