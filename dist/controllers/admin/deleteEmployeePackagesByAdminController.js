"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteEmployeePackagesByAdminService_1 = __importDefault(require("../../services/admin/deleteEmployeePackagesByAdminService"));
const employeePackageMessages_1 = require("../../constants/admin/employeePackageMessages");
const deleteEmployeePackageByAdmin = (req, res) => {
    const { employeeId, packageId } = req.body;
    deleteEmployeePackagesByAdminService_1.default
        .deleteEmployeePackageServiceByAdmin(employeeId, packageId)
        .then((deleteEmployeePackageResponse) => {
        res.status(200).json(deleteEmployeePackageResponse);
    })
        .catch((error) => {
        console.error(`Error in deleting employee packages: ${error}`);
        res.status(500).json({ success: false, message: employeePackageMessages_1.EMPLOYEE_PACKAGE_ERROR_MESSAGES.EMPLOYEE_PACKAGE_DELETE_ERROR_MESSAGE });
    });
};
exports.default = { deleteEmployeePackageByAdmin };
