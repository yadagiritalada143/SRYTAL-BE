"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const employmentTypeModel_1 = __importDefault(require("../../model/employmentTypeModel"));
const deleteEmploymentTypeByAdmin = async (id) => {
    try {
        const result = await employmentTypeModel_1.default.findByIdAndDelete({ _id: id });
        if (!result) {
            return { success: false };
        }
        return { success: true, responseAfterDelete: result };
    }
    catch (error) {
        console.error(`Error in deleting employment type: ${error}`);
        return { success: false, responseAfterDelete: error };
    }
};
exports.default = { deleteEmploymentTypeByAdmin };
