"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const packageMessages_1 = require("../../constants/admin/packageMessages");
const getPackageDetailsByAdminService_1 = __importDefault(require("../../services/admin/getPackageDetailsByAdminService"));
const getPackageDetailsByAdmin = (req, res) => {
    const { id } = req.params;
    getPackageDetailsByAdminService_1.default.getPackageDetailsByAdmin(id)
        .then(packageDetailsByAdminResponse => {
        res.status(200).json(packageDetailsByAdminResponse);
    })
        .catch(error => {
        console.error(`Error in fetching Package details: ${error}`);
        res.status(500).json({ success: false, message: packageMessages_1.PACKAGE_ERROR_MESSAGES.PACKAGE_DETAILS_FETCH_ERROR_MESSAGE });
    });
};
exports.default = { getPackageDetailsByAdmin };
