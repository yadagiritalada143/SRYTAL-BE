"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateBloodGroupByAdminService_1 = __importDefault(require("../../services/admin/updateBloodGroupByAdminService"));
const recruiterErrorMessages_1 = require("../../constants/recruiterErrorMessages");
const updateBloodGroup = (req, res) => {
    const { id, type } = req.body;
    updateBloodGroupByAdminService_1.default
        .updateBloodGroupByAdmin(id, type)
        .then((updateBloodGroupResponse) => {
        res.status(200).json(updateBloodGroupResponse);
    })
        .catch((error) => {
        console.error(`Error in  updating blood group: ${error}`);
        res.status(500).json({ success: false, message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_UPDATING_BLOOD_GROUP_DETAILS });
    });
};
exports.default = { updateBloodGroup };
