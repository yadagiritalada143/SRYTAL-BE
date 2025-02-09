"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const employmentTypeModel_1 = __importDefault(require("../../model/employmentTypeModel"));
const getAllEmploymentTypesByAdmin = () => {
    return new Promise((resolve, reject) => {
        employmentTypeModel_1.default.find({})
            .then((employmentTypesList) => {
            if (!employmentTypesList) {
                reject({ success: false });
            }
            else {
                resolve({
                    success: true,
                    employmentTypesList: employmentTypesList
                });
            }
        })
            .catch((error) => {
            console.error('Error in fetching Employmenttype:', error);
            reject({ success: false });
        });
    });
};
exports.default = { getAllEmploymentTypesByAdmin };
