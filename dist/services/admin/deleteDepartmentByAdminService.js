"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const departmentModel_1 = __importDefault(require("../../model/departmentModel"));
const deleteDepartmentByAdmin = async (_id) => {
    try {
        const department = await departmentModel_1.default.findByIdAndDelete(_id);
        if (!department) {
            return { success: true, responseAfterDelete: department };
        }
        else {
            return { success: false, responseAfterDelete: department };
        }
    }
    catch (error) {
        console.error(`Error in deleting department: ${error}`);
        throw error;
    }
};
exports.default = { deleteDepartmentByAdmin };
