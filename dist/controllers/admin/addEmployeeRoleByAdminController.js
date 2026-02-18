"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addEmployeeRoleByAdminService_1 = __importDefault(require("../../services/admin/addEmployeeRoleByAdminService"));
const employeeRolesMessages_1 = require("../../constants/admin/employeeRolesMessages");
const addEmployeeRoleByAdmin = (req, res) => {
    const { designation } = req.body;
    addEmployeeRoleByAdminService_1.default
        .addEmployeeRoleByAdmin(designation)
        .then((responseAfteraddingEmployeeRole) => {
        if (responseAfteraddingEmployeeRole.id) {
            return res
                .status(201)
                .json({ message: employeeRolesMessages_1.EMPLOYEE_ROLE_SUCCESS_MESSAGES.EMPLOYEE_ROLE_ADD_SUCCESS_MESSAGE });
        }
        else {
            return res
                .status(400)
                .json({ message: employeeRolesMessages_1.EMPLOYEE_ROLE_ERRORS_MESSAGES.EMPLOYEE_ROLE_ADD_ERROR_MESSAGE });
        }
    })
        .catch((error) => {
        console.error(error);
    });
};
exports.default = { addEmployeeRoleByAdmin };
