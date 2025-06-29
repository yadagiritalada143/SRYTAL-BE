"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const packageMessages_1 = require("../../constants/admin/packageMessages");
const getAllPackagesByAdminService_1 = __importDefault(require("../../services/admin/getAllPackagesByAdminService"));
const getAllPackagesDetails = (req, res) => {
    getAllPackagesByAdminService_1.default.getAllPackagesWithTasksByAdmin()
        .then(fetchAllPackagesByAdminResponse => {
        res.status(200).json(fetchAllPackagesByAdminResponse);
    })
        .catch(error => {
        console.error(`Error in fetching Packages details: ${error}`);
        res.status(500).json({ success: false, message: packageMessages_1.PACKAGE_ERROR_MESSAGES.PACKAGE_FETCH_ERROR_MESSAGE });
    });
};
exports.default = { getAllPackagesDetails };
