"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateEmployeeRoleByAdminService_1 = __importDefault(require("../../services/admin/updateEmployeeRoleByAdminService"));
const employeeRolesMessages_1 = require("../../constants/admin/employeeRolesMessages");
const updateEmployeeRole = (req, res) => {
    const { id, designation } = req.body;
    updateEmployeeRoleByAdminService_1.default
        .updateEmployeeRoleByAdmin(id, designation)
        .then((updateEmployeeRoleResponse) => {
        res.status(200).json(updateEmployeeRoleResponse);
    })
        .catch((error) => {
        console.error(`Error in updating employee role: ${error}`);
        res.status(500).json({ success: false, message: employeeRolesMessages_1.EMPLOYEE_ROLE_ERRORS_MESSAGES.EMPLOYEE_ROLE_UPDATING_ERROR_MESSAGE });
    });
};
exports.default = { updateEmployeeRole };
