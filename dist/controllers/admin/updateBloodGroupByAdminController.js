"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateBloodGroupByAdminService_1 = __importDefault(require("../../services/admin/updateBloodGroupByAdminService"));
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const updateBloodGroup = (req, res) => {
    const id = req.params.id;
    updateBloodGroupByAdminService_1.default
        .updateBloodGroupByAdmin(id)
        .then((updateBloodGroupResponse) => {
        res.status(200).json(updateBloodGroupResponse);
    })
        .catch((error) => {
        console.error(`Error in  updating blood group: ${error}`);
        res.status(500).json({ success: false, message: commonErrorMessages_1.COMMON_ERRORS.USER_UPDATING_ERROR });
    });
};
exports.default = { updateBloodGroup };
