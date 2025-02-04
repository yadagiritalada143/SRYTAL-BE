"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../../model/userModel"));
const getAllEmployeeDetailsByAdmin = (organizationId, userId) => {
    return new Promise((resolve, reject) => {
        userModel_1.default.find({
            organization: organizationId,
            _id: { $ne: userId } // Exclude the user with the provided userId
        })
            .populate('bloodGroup')
            .populate('employmentType')
            .populate('employeeRole')
            .populate('organization')
            .then((users) => {
            if (!users) {
                reject({ success: false });
            }
            else {
                resolve({
                    success: true,
                    usersList: users
                });
            }
        })
            .catch((error) => {
            console.error('Error in fetching Employee details:', error);
            reject({ success: false });
        });
    });
};
exports.default = { getAllEmployeeDetailsByAdmin };
