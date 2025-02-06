"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteBloodGroupByAdminService_1 = __importDefault(require("../../services/admin/deleteBloodGroupByAdminService"));
const manageUserMessages_1 = require("../../constants/admin/manageUserMessages");
const deleteBloodGroup = (req, res) => {
    const id = req.params.id;
    deleteBloodGroupByAdminService_1.default
        .DeleteBloodGroupByAdmin(id)
        .then((deleteBloodGroupResponse) => {
        res.status(200).json(deleteBloodGroupResponse);
    })
        .catch((error) => {
        console.error(`Error in  deleting blood group: ${error}`);
        res.status(500).json({ success: false, message: manageUserMessages_1.DELETE_ERROR_MESSAGES.DELETE_BLOOD_GROUP_DELETE_ERROR_MESSAGE });
    });
};
exports.default = { deleteBloodGroup };
