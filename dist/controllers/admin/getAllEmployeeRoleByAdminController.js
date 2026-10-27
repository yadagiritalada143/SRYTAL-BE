"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const employeeRolesMessages_1 = require("../../constants/admin/employeeRolesMessages");
const getAllEmployeeRoleByAdminService_1 = __importDefault(require("../../services/admin/getAllEmployeeRoleByAdminService"));
const getAllEmployeeRolesByAdmin = (req, res) => {
    getAllEmployeeRoleByAdminService_1.default.getAllEmployeeRolesByAdmin()
        .then((fetchAllEmployeeRolesResponse) => {
        res.status(200).json(fetchAllEmployeeRolesResponse);
    })
        .catch(error => {
        console.error(`Error in fetching employee roles: ${error}`);
        res.status(500).json({ success: false, message: employeeRolesMessages_1.EMPLOYEE_ROLE_ERRORS_MESSAGES.EMPLOYEE_ROLE_FETCH_ERROR_MESSAGES });
    });
};
exports.default = { getAllEmployeeRolesByAdmin };
