"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const employeePasswordResetByAdminService_1 = __importDefault(require("../../services/admin/employeePasswordResetByAdminService"));
const adminErrorMessages_1 = require("../../constants/adminErrorMessages");
const employeePasswordResetByAdmin = (req, res) => {
    const { employeeId } = req.body;
    employeePasswordResetByAdminService_1.default
        .employeePasswordResetByAdmin(employeeId)
        .then((afterForcePasswordResetResponse) => {
        if (afterForcePasswordResetResponse) {
            res.status(200).json({ success: true });
        }
        else {
            res.status(400).json({ success: false, message: adminErrorMessages_1.ADMIN_ERROR_MESSAGES.RESET_EMPLOYEE_PASSWORD_ERROR });
        }
    })
        .catch((error) => {
        console.error(`Error occured while asking to reset the password: ${error}`);
        res.status(500).json({ success: true, message: adminErrorMessages_1.ADMIN_ERROR_MESSAGES.RESET_EMPLOYEE_PASSWORD_ERROR });
    });
};
exports.default = { employeePasswordResetByAdmin };
