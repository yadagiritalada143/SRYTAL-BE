"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../../model/userModel"));
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
            usersList: users
        };
    }
    catch (error) {
        console.error(`Error in fetching Employee details: ${error}`);
        throw { success: false };
    }
};
exports.default = { getAllEmployeeDetailsByAdmin };
