"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addDepartmentByAdminService_1 = __importDefault(require("../../services/admin/addDepartmentByAdminService"));
const departmentMessages_1 = require("../../constants/admin/departmentMessages");
const addDepartmentByAdmin = async (req, res) => {
    try {
        const { departmentName } = req.body;
        await addDepartmentByAdminService_1.default.addDepartmentByAdmin(departmentName);
        return res.status(departmentMessages_1.HTTP_STATUS.OK).json({
            success: true,
            message: departmentMessages_1.DEPARTMENT_SUCCESS_MESSAGES.DEPARTMENT_ADD_SUCCESS_MESSAGE,
        });
    }
    catch (error) {
        console.error(`Error while adding department: ${error}`);
        return res.status(departmentMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: departmentMessages_1.DEPARTMENT_ERROR_MESSAGES.DEPARTMENT_ADD_ERROR_MESSAGE,
        });
    }
};
exports.default = { addDepartmentByAdmin };
