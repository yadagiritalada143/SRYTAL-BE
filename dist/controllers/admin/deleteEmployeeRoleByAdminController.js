"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteEmployeeRoleByAdminService_1 = __importDefault(require("../../services/admin/deleteEmployeeRoleByAdminService"));
const employeeRolesMessages_1 = require("../../constants/admin/employeeRolesMessages");
const deleteEmployeeRole = (req, res) => {
    const { id } = req.params;
    deleteEmployeeRoleByAdminService_1.default
        .deleteEmployeeRoleByAdmin(id)
        .then((deleteEmployeeRoleResponse) => {
        res.status(200).json(deleteEmployeeRoleResponse);
    })
        .catch((error) => {
        console.error(`Error in deleting employee role: ${error}`);
        res.status(500).json({ success: false, message: employeeRolesMessages_1.EMPLOYEE_ROLE_ERRORS_MESSAGES.EMPLOYEE_ROLE_DELETE_ERROR_MESSAGE });
    });
};
exports.default = { deleteEmployeeRole };
