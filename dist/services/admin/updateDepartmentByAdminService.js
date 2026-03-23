"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const departmentModel_1 = __importDefault(require("../../model/departmentModel"));
const updateDepartmentByAdmin = async (_id, departmentName) => {
    try {
        const result = await departmentModel_1.default.updateOne({ _id }, { departmentName });
        if (result) {
            return { success: true, departmentResponse: result };
        }
        else {
            return { success: false, departmentResponse: null };
        }
    }
    catch (error) {
        throw new Error('An error occurred while updating the department.');
    }
};
exports.default = { updateDepartmentByAdmin };
