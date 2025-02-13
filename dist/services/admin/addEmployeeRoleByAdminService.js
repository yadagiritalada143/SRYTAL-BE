"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const employeeRole_1 = __importDefault(require("../../model/employeeRole"));
const addEmployeeRoleByAdmin = async (designation) => {
    try {
        const employeeRoleToSave = new employeeRole_1.default({ designation });
        const result = await employeeRoleToSave.save();
        return result;
    }
    catch (error) {
        console.error('Error in adding employee role:', error);
        return { success: false };
    }
};
exports.default = { addEmployeeRoleByAdmin };
