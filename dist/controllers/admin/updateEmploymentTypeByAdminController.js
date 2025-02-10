"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateEmploymentTypeByAdminService_1 = __importDefault(require("../../services/admin/updateEmploymentTypeByAdminService"));
const employmenttypeMessages_1 = require("../../constants/admin/employmenttypeMessages");
const updateEmploymentType = (req, res) => {
    const { id, employmentType } = req.body;
    updateEmploymentTypeByAdminService_1.default
        .updateEmploymentTypeByAdmin(id, employmentType)
        .then((updateEmploymentTypeResponse) => {
        res.status(200).json(updateEmploymentTypeResponse);
    })
        .catch((error) => {
        console.error(`Error in updating employment type: ${error}`);
        res.status(500).json({ success: false, message: employmenttypeMessages_1.EMPLOYMENT_TYPE_ERRORS_MESSAGES.EMPLOYMENT_TYPE_UPDATING_ERROR_MESSAGE });
    });
};
exports.default = { updateEmploymentType };
