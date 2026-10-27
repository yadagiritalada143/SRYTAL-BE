"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const employmentTypeModel_1 = __importDefault(require("../../model/employmentTypeModel"));
const updateEmploymentTypeByAdmin = async (id, employmentType) => {
    try {
        const result = await employmentTypeModel_1.default.updateMany({ _id: id }, { employmentType });
        if (!result) {
            return { success: false };
        }
        return { success: true, responseAfterUpdate: result };
    }
    catch (error) {
        console.error(`Error in  updating employment type: ${error}`);
        return { success: false, responseAfterUpdate: error };
    }
};
exports.default = { updateEmploymentTypeByAdmin };
