"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const departmentModel_1 = __importDefault(require("../../model/departmentModel"));
const getAllDepartmentsByAdmin = async () => {
    try {
        const departments = await departmentModel_1.default.find({});
        if (!departments) {
            throw { success: false };
        }
        return {
            success: true,
            departments: departments,
        };
    }
    catch (error) {
        console.error(`Error in fetching Departments: ${error}`);
        throw { success: false };
    }
};
exports.default = { getAllDepartmentsByAdmin };
