"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteDepartmentByAdminService_1 = __importDefault(require("../../services/admin/deleteDepartmentByAdminService"));
const departmentMessages_1 = require("../../constants/admin/departmentMessages");
const deleteDepartmentByAdmin = async (req, res) => {
    try {
        const _id = req.params._id;
        await deleteDepartmentByAdminService_1.default.deleteDepartmentByAdmin(_id);
        return res.status(departmentMessages_1.HTTP_STATUS.OK).json({ success: true, message: departmentMessages_1.DEPARTMENT_SUCCESS_MESSAGES.DEPARTMENT_DELETE_SUCCESS_MESSAGE });
    }
    catch (error) {
        console.error(`Error in deleting department: ${error}`);
        return res.status(departmentMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: departmentMessages_1.DEPARTMENT_ERROR_MESSAGES.DEPARTMENT_DELETE_ERROR_MESSAGE });
    }
};
exports.default = { deleteDepartmentByAdmin };
