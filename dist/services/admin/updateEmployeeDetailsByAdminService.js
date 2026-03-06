"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../../model/userModel"));
const formatDate = (date) => {
    if (!date)
        return null;
    const d = new Date(date);
    if (isNaN(d.getTime()))
        return null;
    const day = String(d.getDate()).padStart(2, '0');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
};
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
            dateOfBirth: formatDate(userDetailsToUpdate.dateOfBirth),
            aadharNumber: userDetailsToUpdate.aadharNumber,
            panCardNumber: userDetailsToUpdate.panCardNumber,
            uanNumber: userDetailsToUpdate.uanNumber,
            department: userDetailsToUpdate.department,
            dateOfJoining: formatDate(userDetailsToUpdate.dateOfJoining),
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
