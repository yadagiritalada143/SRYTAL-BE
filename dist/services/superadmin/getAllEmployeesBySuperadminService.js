"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../../model/userModel"));
const getAllEmployeesBySuperadmin = (organizationId) => {
    return new Promise((resolve, reject) => {
        userModel_1.default.find({ organization: organizationId })
            .then((users) => {
            if (!users) {
                reject({ success: false });
            }
            else {
                resolve({
                    success: true,
                    superadminEmployeeList: users,
                });
            }
        })
            .catch((error) => {
            console.error('Error in fetching superadmin Employee details:', error);
            reject({ success: false });
        });
    });
};
exports.default = { getAllEmployeesBySuperadmin };
