"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const departmentModel_1 = __importDefault(require("../../model/departmentModel"));
const getAllDepartmentByAdminService = async () => {
    const departments = await departmentModel_1.default.find();
    const departmentResponse = departments.map((department) => ({
        _id: department._id,
        departmentName: department.departmentName,
    }));
    return { success: true, departmentResponse: departmentResponse };
};
exports.default = { getAllDepartmentByAdminService };
