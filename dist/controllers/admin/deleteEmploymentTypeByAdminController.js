"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteEmploymentTypeByAdminService_1 = __importDefault(require("../../services/admin/deleteEmploymentTypeByAdminService"));
const employementTypesMessages_1 = require("../../constants/admin/employementTypesMessages");
const deleteEmploymentType = (req, res) => {
    const { id } = req.params;
    deleteEmploymentTypeByAdminService_1.default
        .deleteEmploymentTypeByAdmin(id)
        .then((deleteEmploymentTypeResponse) => {
        res.status(200).json(deleteEmploymentTypeResponse);
    })
        .catch((error) => {
        console.error(`Error in deleting employment type: ${error}`);
        res.status(500).json({ success: false, message: employementTypesMessages_1.EMPLOYMENT_TYPE_ERRORS_MESSAGES.EMPLOYMENT_TYPE_DELETE_ERROR_MESSAGE });
    });
};
exports.default = { deleteEmploymentType };
