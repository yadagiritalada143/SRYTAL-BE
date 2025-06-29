"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const packageMessages_1 = require("../../constants/admin/packageMessages");
const getEmployeePackagesByAdminService_1 = __importDefault(require("../../services/admin/getEmployeePackagesByAdminService"));
const getEmployeePackageDetailsByAdmin = (req, res) => {
    const { employeeId } = req.params;
    getEmployeePackagesByAdminService_1.default.getEmployeePackageDetailsByAdmin(employeeId)
        .then(employeePackageDetailsByAdminResponse => {
        res.status(200).json(employeePackageDetailsByAdminResponse);
    })
        .catch(error => {
        console.error(`Error in fetching Employee Package details: ${error}`);
        res.status(500).json({ success: false, message: packageMessages_1.PACKAGE_ERROR_MESSAGES.PACKAGE_DETAILS_FETCH_ERROR_MESSAGE });
    });
};
exports.default = { getEmployeePackageDetailsByAdmin };
