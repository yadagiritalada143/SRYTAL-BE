"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../../model/userModel"));
const updateEmployeeProfileByAdmin = async (userDetailsToUpdate) => {
    return new Promise(async (resolve, reject) => {
        const result = await userModel_1.default.updateOne({ email: userDetailsToUpdate.email }, {
            firstName: userDetailsToUpdate.firstName,
            lastName: userDetailsToUpdate.lastName,
            mobileNumber: userDetailsToUpdate.mobileNumber,
            bloodGroup: userDetailsToUpdate.bloodGroup,
            bankDetailsInfo: userDetailsToUpdate.bankDetailsInfo,
            employmentType: userDetailsToUpdate.employmentType,
            employeeRole: userDetailsToUpdate.employeeRole,
            organization: userDetailsToUpdate.organization,
            employeeId: userDetailsToUpdate.employeeId,
            dateOfBirth: userDetailsToUpdate.dateOfBirth,
            presentAddress: userDetailsToUpdate.presentAddress,
            permanentAddress: userDetailsToUpdate.permanentAddress
        })
            .then((responseAfterUpdateProfile) => {
            resolve({
                success: true
            });
        })
            .catch((error) => {
            console.error('Error in updating Profile:', error);
            reject({ success: false });
        });
    });
};
exports.default = { updateEmployeeProfileByAdmin };
