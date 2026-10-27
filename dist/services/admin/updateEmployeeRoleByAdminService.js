"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const employeeRole_1 = __importDefault(require("../../model/employeeRole"));
const updateEmployeeRoleByAdmin = async (id, designation) => {
    try {
        const result = await employeeRole_1.default.updateMany({ _id: id }, { designation });
        if (!result) {
            return { success: false };
        }
        return { success: true, responseAfterUpdate: result };
    }
    catch (error) {
        console.error(`Error in updating employee role: ${error}`);
        return { success: false, responseAfterUpdate: error };
    }
};
exports.default = { updateEmployeeRoleByAdmin };
