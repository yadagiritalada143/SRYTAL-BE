"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getDepartmentByAdminService_1 = __importDefault(require("../../services/admin/getDepartmentByAdminService"));
const departmentMessages_1 = require("../../constants/admin/departmentMessages");
const getDepartmentByAdmin = async (req, res) => {
    try {
        const { _id } = req.params;
        const departmentDetails = await getDepartmentByAdminService_1.default.getDepartmentByAdmin(_id);
        if (!departmentDetails) {
            return res.status(departmentMessages_1.HTTP_STATUS.NOT_FOUND).json({ success: false, message: departmentMessages_1.DEPARTMENT_ERROR_MESSAGES.DEPARTMENT_NOT_FOUND_ERROR_MESSAGE });
        }
        return res.status(departmentMessages_1.HTTP_STATUS.OK).json({ success: true, message: departmentMessages_1.DEPARTMENT_SUCCESS_MESSAGES.FETCH_DEPARTMENT_SUCCESS_MESSAGE, data: departmentDetails });
    }
    catch (error) {
        console.error(`Error in fetching department details: ${error}`);
        return res.status(departmentMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: departmentMessages_1.DEPARTMENT_ERROR_MESSAGES.FETCH_DEPARTMENT_ERROR_MESSAGE });
    }
};
exports.default = { getDepartmentByAdmin };
