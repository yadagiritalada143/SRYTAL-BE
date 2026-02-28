"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../../model/userModel"));
const updateEmployeeProfileByAdmin = async (userDetailsToUpdate) => {
    try {
        await userModel_1.default.updateOne({ email: userDetailsToUpdate.email }, {
            firstName: userDetailsToUpdate.firstName,
            lastName: userDetailsToUpdate.lastName,
            mobileNumber: userDetailsToUpdate.mobileNumber,
            bloodGroup: userDetailsToUpdate.bloodGroup,
            bankDetailsInfo: userDetailsToUpdate.bankDetailsInfo,
            employmentType: userDetailsToUpdate.employmentType,
            employeeRole: userDetailsToUpdate.employeeRole,
            employeeId: userDetailsToUpdate.employeeId,
            dateOfBirth: userDetailsToUpdate.dateOfBirth,
            aadharNumber: userDetailsToUpdate.aadharNumber,
            panCardNumber: userDetailsToUpdate.panCardNumber,
            presentAddress: userDetailsToUpdate.presentAddress,
            permanentAddress: userDetailsToUpdate.permanentAddress,
        });
        return { success: true };
    }
    catch (error) {
        console.error(`Error in updating Profile: ${error}`);
        throw error;
    }
};
exports.default = { updateEmployeeProfileByAdmin };
