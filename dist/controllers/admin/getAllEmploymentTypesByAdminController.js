"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const employmenttypeMessages_1 = require("../../constants/admin/employmenttypeMessages");
const getAllEmploymentTypeByAdminService_1 = __importDefault(require("../../services/admin/getAllEmploymentTypeByAdminService"));
const getAllEmploymentTypesByAdmin = (req, res) => {
    getAllEmploymentTypeByAdminService_1.default.getAllEmploymentTypesByAdmin()
        .then(fetchAllEmploymentTypesResponse => {
        res.status(200).json(fetchAllEmploymentTypesResponse);
    })
        .catch(error => {
        console.error(`Error in fetching employment type details: ${error}`);
        res.status(500).json({ success: false, message: employmenttypeMessages_1.EMPLOYMENT_TYPE_ERRORS_MESSAGES.EMPLOYMENT_TYPE_FETCH_ERROR_MESSAGES });
    });
};
exports.default = { getAllEmploymentTypesByAdmin };
