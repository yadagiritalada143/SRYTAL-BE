"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const departmentModel_1 = __importDefault(require("../../model/departmentModel"));
const addDepartmentByAdminService = async (departmentName) => {
    try {
        const department = new departmentModel_1.default({ departmentName });
        const result = await department.save();
        return result;
    }
    catch (error) {
        console.error(`Error while adding department: ${error}`);
        throw new Error('An error occurred while adding department.');
    }
};
exports.default = { addDepartmentByAdminService };
