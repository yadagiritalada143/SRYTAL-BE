"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const packageMessages_1 = require("../../constants/admin/packageMessages");
const getAllPackagesByAdminService_1 = __importDefault(require("../../services/admin/getAllPackagesByAdminService"));
const getAllPackagesDetails = async (req, res) => {
    try {
        const fetchAllPackagesByAdminResponse = await getAllPackagesByAdminService_1.default.getAllPackagesWithTasksByAdmin();
        res.status(packageMessages_1.HTTP_STATUS.OK).json(fetchAllPackagesByAdminResponse);
    }
    catch (error) {
        console.error(`Error in fetching Packages details: ${error}`);
        res.status(packageMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: packageMessages_1.PACKAGE_ERROR_MESSAGES.PACKAGE_FETCH_ERROR_MESSAGE });
    }
};
exports.default = { getAllPackagesDetails };
