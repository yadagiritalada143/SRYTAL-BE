"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addPackageByAdminService_1 = __importDefault(require("../../services/admin/addPackageByAdminService"));
const packageMessages_1 = require("../../constants/admin/packageMessages");
const addPackageByAdminController = (req, res) => {
    const addPackageDetails = req.body;
    addPackageDetails.isDeleted = false;
    addPackageByAdminService_1.default
        .addPackageByAdmin(addPackageDetails)
        .then((responseAfteraddingPackages) => {
        res.status(200).json({ succes: true });
    })
        .catch((error) => {
        console.log(`Error while adding packages: ${error}`);
        res.status(500).json({ success: false, message: packageMessages_1.PACKAGE_ERROR_MESSAGES.PACKAGE_ADD_ERROR_MESSAGE });
    });
};
exports.default = { addPackageByAdminController };
