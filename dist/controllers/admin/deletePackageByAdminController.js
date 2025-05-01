"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deletePackageByAdminService_1 = __importDefault(require("../../services/admin/deletePackageByAdminService"));
const packageMessages_1 = require("../../constants/admin/packageMessages");
const deletePackageByAdmin = (req, res) => {
    const { confirmDelete } = req.body;
    const { id } = req.params;
    if (confirmDelete) {
        deletePackageByAdminService_1.default
            .hardDeletePackageServiceByAdmin(id)
            .then((deletePackageResponse) => {
            res.status(200).json(deletePackageResponse);
        })
            .catch((error) => {
            console.error(`Error in (hard) deleting package: ${error}`);
            res.status(500).json({ success: false, message: packageMessages_1.PACKAGE_ERROR_MESSAGES.PACKAGE_HARD_DELETE_ERROR_MESSAGE });
        });
    }
    else {
        deletePackageByAdminService_1.default
            .softDeletePackageServiceByAdmin(id)
            .then((deletePackageResponse) => {
            res.status(200).json(deletePackageResponse);
        })
            .catch((error) => {
            console.error(`Error in (soft)  deleting package: ${error}`);
            res.status(500).json({ success: false, message: packageMessages_1.PACKAGE_ERROR_MESSAGES.PACKAGE_SOFT_DELETE_ERROR_MESSAGE });
        });
    }
};
exports.default = { deletePackageByAdmin };
