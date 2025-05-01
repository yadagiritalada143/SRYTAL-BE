"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updatePackageByAdminService_1 = __importDefault(require("../../services/admin/updatePackageByAdminService"));
const packageMessages_1 = require("../../constants/admin/packageMessages");
const updatePackageByAdminController = (req, res) => {
    const { id, detailsToUpdate } = req.body;
    updatePackageByAdminService_1.default
        .updatePackageByAdmin(id, detailsToUpdate)
        .then((updatePackageResponse) => {
        res.status(200).json(updatePackageResponse);
    })
        .catch((error) => {
        console.error(`Error in  updating packages: ${error}`);
        res.status(500).json({ success: false, message: packageMessages_1.PACKAGE_ERROR_MESSAGES.PACKAGE_UPDATING_ERROR_MESSAGE });
    });
};
exports.default = { updatePackageByAdminController };
