"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const departmentModel_1 = __importDefault(require("../../model/departmentModel"));
const getDepartmentByAdmin = async (_id) => {
    try {
        return await departmentModel_1.default.findOne({ _id });
    }
    catch (error) {
        throw new Error('Error in fetching department details');
    }
    ;
};
exports.default = { getDepartmentByAdmin };
