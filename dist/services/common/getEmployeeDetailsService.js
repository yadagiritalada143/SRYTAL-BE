"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../../model/userModel"));
const getEmployeeDetails = (id) => {
    return new Promise((resolve, reject) => {
        userModel_1.default.findOne({ _id: id })
            .populate('bloodGroup')
            .populate('employeeRole')
            .populate('employmentType')
            .populate('organization')
            .then((employee) => {
            if (!employee) {
                reject({ success: false });
            }
            else {
                resolve({
                    success: true,
                    employeeDetails: {
                        id: employee.id,
                        firstName: employee.firstName,
                        lastName: employee.lastName,
                        email: employee.email,
                        mobileNumber: employee.mobileNumber,
                        bloodGroup: employee.bloodGroup,
                        bankDetailsInfo: employee.bankDetailsInfo,
                        employeeRole: employee.employeeRole,
                        employmentType: employee.employmentType,
                        organization: employee.organization,
                        userRole: employee.userRole,
                        passwordResetRequired: employee.passwordResetRequired,
                    }
                });
            }
        })
            .catch((error) => {
            console.error('Error in getting employee details:', error);
            reject({ success: false });
        });
    });
};
exports.default = { getEmployeeDetails };
