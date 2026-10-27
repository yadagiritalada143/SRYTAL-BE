"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const employeeRole_1 = __importDefault(require("../../model/employeeRole"));
const getAllEmployeeRolesByAdmin = () => {
    return new Promise((resolve, reject) => {
        employeeRole_1.default.find({})
            .then((employeeRoles) => {
            if (!employeeRoles) {
                reject({ success: false });
            }
            else {
                resolve({
                    success: true,
                    employeeRoles: employeeRoles
                });
            }
        })
            .catch((error) => {
            console.error(`Error in fetching Employee roles: ${error}`);
            reject({ success: false });
        });
    });
};
exports.default = { getAllEmployeeRolesByAdmin };
