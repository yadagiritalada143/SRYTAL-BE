"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllDepartmentByAdminService_1 = __importDefault(require("../../services/admin/getAllDepartmentByAdminService"));
const departmentMessages_1 = require("../../constants/admin/departmentMessages");
const getAllDepartmentByAdminController = async (req, res) => {
    try {
        const departments = await getAllDepartmentByAdminService_1.default.getAllDepartmentByAdminService();
        return res.status(departmentMessages_1.HTTP_STATUS.OK).json({ success: true, message: departmentMessages_1.DEPARTMENT_SUCCESS_MESSAGES.FETCH_ALL_DEPARTMENTS_SUCCESS_MESSAGE, data: departments });
    }
    catch (error) {
        console.error(`Error fetching all departments: ${error}`);
        return res.status(departmentMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: departmentMessages_1.DEPARTMENT_ERROR_MESSAGES.FETCH_ALL_DEPARTMENTS_ERROR_MESSAGE });
    }
};
exports.default = { getAllDepartmentByAdminController };
