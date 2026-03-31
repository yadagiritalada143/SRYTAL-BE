"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateDepartmentByAdminService_1 = __importDefault(require("../../services/admin/updateDepartmentByAdminService"));
const departmentMessages_1 = require("../../constants/admin/departmentMessages");
const updateDepartmentByAdmin = async (req, res) => {
    try {
        const { _id, departmentName } = req.body;
        await updateDepartmentByAdminService_1.default.updateDepartmentByAdmin(_id, departmentName);
        return res.status(departmentMessages_1.HTTP_STATUS.OK).json({
            success: true,
            message: departmentMessages_1.DEPARTMENT_SUCCESS_MESSAGES.DEPARTMENT_UPDATE_SUCCESS_MESSAGE,
        });
    }
    catch (error) {
        console.error(`Error updating department: ${error}`);
        return res.status(departmentMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: departmentMessages_1.DEPARTMENT_ERROR_MESSAGES.DEPARTMENT_UPDATE_ERROR_MESSAGE,
        });
    }
};
exports.default = { updateDepartmentByAdmin };
