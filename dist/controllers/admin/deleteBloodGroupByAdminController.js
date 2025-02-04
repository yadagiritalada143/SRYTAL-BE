"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteBloodGroupByAdminService_1 = __importDefault(require("../../services/admin/deleteBloodGroupByAdminService"));
const manageUserMessages_1 = require("../../constants/admin/manageUserMessages");
const deleteBloodGroup = async (req, res) => {
    try {
        const { _id, confirmDelete } = req.body;
        if (!_id || confirmDelete !== true) {
            return res.status(400).json({ success: false, message: "Valid Blood Group ID and confirmation are required." });
        }
        const { success } = await deleteBloodGroupByAdminService_1.default.deleteBloodGroupByAdmin(_id);
        if (!success) {
            return res.status(404).json({ success: false, message: "Blood Group not found or already deleted." });
        }
        return res.status(200).json({ success: true, message: "Blood Group deleted successfully." });
    }
    catch (error) {
        console.error(`Error deleting blood group: ${error}`);
        return res.status(500).json({
            success: false,
            message: manageUserMessages_1.DELETE_ERROR_MESSAGES.DELETE_BLOOD_GROUP_DELETE_ERROR_MESSAGE || "Internal Server Error."
        });
    }
};
exports.default = { deleteBloodGroup };
