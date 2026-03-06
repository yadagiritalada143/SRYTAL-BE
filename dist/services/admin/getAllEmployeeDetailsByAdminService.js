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
const getAllEmployeeDetailsByAdmin = async (organizationId, userId) => {
    try {
        const users = await userModel_1.default.find({
            organization: organizationId,
            _id: { $ne: userId }, // Exclude the user with the provided userId
            isDeleted: false
        })
            .populate('bloodGroup')
            .populate('employmentType')
            .populate('employeeRole')
            .populate('organization');
        if (!users) {
            return { success: false };
        }
        return {
            success: true,
            usersList: users.map((user) => ({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                mobileNumber: user.mobileNumber,
                bloodGroup: user.bloodGroup,
                bankDetailsInfo: user.bankDetailsInfo,
                employmentType: user.employmentType,
                employeeRole: user.employeeRole,
                organization: user.organization,
                userRole: user.userRole,
                passwordResetRequired: user.passwordResetRequired,
                employeeId: user.employeeId,
                dateOfBirth: formatDate(user.dateOfBirth),
                aadharNumber: user.aadharNumber,
                panCardNumber: user.panCardNumber,
                dateOfJoining: formatDate(user.dateOfJoining),
                uanNumber: user.uanNumber,
                department: user.department,
                presentAddress: user.presentAddress,
                permanentAddress: user.permanentAddress
            }))
        };
    }
    catch (error) {
        console.error(`Error in fetching Employee details: ${error}`);
        throw { success: false };
    }
};
exports.default = { getAllEmployeeDetailsByAdmin };
