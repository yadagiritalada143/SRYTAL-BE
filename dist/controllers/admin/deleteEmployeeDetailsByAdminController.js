"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteEmployeeDetailsByAdminService_1 = __importDefault(require("../../services/admin/deleteEmployeeDetailsByAdminService"));
const manageUserMessages_1 = require("../../constants/admin/manageUserMessages");
const deleteProfile = (req, res) => {
    const { id, confirmDelete } = req.body;
    if (confirmDelete) {
        deleteEmployeeDetailsByAdminService_1.default
            .hardDeleteEmployeeProfileByAdmin(id)
            .then((deleteProfileResponse) => {
            res.status(200).json(deleteProfileResponse);
        })
            .catch((error) => {
            console.error(`Error in (soft) deleting profile details: ${error}`);
            res.status(500).json({ success: false, message: manageUserMessages_1.DELETE_ERROR_MESSAGES.DELETE_USER_HARD_DELETE_ERROR_MESSAGE });
        });
    }
    else {
        deleteEmployeeDetailsByAdminService_1.default
            .softDeleteEmployeeProfileByAdmin(id)
            .then((deleteProfileResponse) => {
            res.status(200).json(deleteProfileResponse);
        })
            .catch((error) => {
            console.error(`Error in (hard) profile details: ${error}`);
            res.status(500).json({ success: false, message: manageUserMessages_1.DELETE_ERROR_MESSAGES.DELETE_USER_SOFT_DELETE_ERROR_MESSAGE });
        });
    }
};
exports.default = { deleteProfile };
