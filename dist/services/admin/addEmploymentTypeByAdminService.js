"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const employmentTypeModel_1 = __importDefault(require("../../model/employmentTypeModel"));
const addEmploymentTypeByAdmin = async (employmentType) => {
    try {
        const employmentTypeToSave = new employmentTypeModel_1.default({ employmentType });
        const result = await employmentTypeToSave.save();
        return result;
    }
    catch (error) {
        console.error(`Error in adding employment type: ${error}`);
        return { success: false };
    }
};
exports.default = { addEmploymentTypeByAdmin };
