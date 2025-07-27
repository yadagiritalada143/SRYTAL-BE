"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const packageMessages_1 = require("../../constants/admin/packageMessages");
const employeePackageDetailsByIdService_1 = __importDefault(require("../../services/common/employeePackageDetailsByIdService"));
const employeePackageDetailsByIdController = (req, res) => {
    const { userId, startDate, endDate } = req.body;
    let employeeIdToFetchTimeSheet = '';
    if (req.body && req.body.employeeId) {
        employeeIdToFetchTimeSheet = req.body.employeeId;
    }
    else {
        employeeIdToFetchTimeSheet = userId;
    }
    if (!startDate || !endDate) {
        return res.status(400).json({
            success: false,
            message: 'FROM date and TO date are required !!'
        });
    }
    employeePackageDetailsByIdService_1.default.employeePackageDetailsById(employeeIdToFetchTimeSheet, startDate, endDate)
        .then(employeePackageDetailsByIdResponse => {
        res.status(200).json(employeePackageDetailsByIdResponse);
    })
        .catch(error => {
        console.error(`Error in fetching Employee Package details: ${error}`);
        res.status(500).json({ success: false, message: packageMessages_1.PACKAGE_ERROR_MESSAGES.PACKAGE_DETAILS_FETCH_ERROR_MESSAGE });
    });
};
exports.default = { employeePackageDetailsByIdController };
