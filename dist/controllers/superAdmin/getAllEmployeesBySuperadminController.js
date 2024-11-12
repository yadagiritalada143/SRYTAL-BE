"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const superadminErrorMessage_1 = require("../../constants/superAdmin/superadminErrorMessage");
const getAllEmployeesBySuperAdminService_1 = __importDefault(require("../../services/superAdmin/getAllEmployeesBySuperAdminService"));
const getAllEmployeesBySuperAdmin = (req, res) => {
    const { organizationId } = req.params;
    getAllEmployeesBySuperAdminService_1.default
        .getAllEmployeesBySuperadminService(organizationId)
        .then(fetchAllEmployeesBySuperadminResponse => {
        res.status(200).json(fetchAllEmployeesBySuperadminResponse);
    })
        .catch(error => {
        console.error(`Error in fetching all superadmin employee details:${error} `);
        res.status(500).json({ success: false, message: superadminErrorMessage_1.SUPERADMIN_ERROR.FETCHING_ALL_EMPLOYEE_DETAILS_ERROR });
    });
};
exports.default = { getAllEmployeesBySuperAdmin };
