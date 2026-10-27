"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addEmploymentTypeByAdminService_1 = __importDefault(require("../../services/admin/addEmploymentTypeByAdminService"));
const employementTypesMessages_1 = require("../../constants/admin/employementTypesMessages");
const addEmploymentTypeByAdmin = (req, res) => {
    const { employmentType } = req.body;
    addEmploymentTypeByAdminService_1.default
        .addEmploymentTypeByAdmin(employmentType)
        .then((responseAfteraddingEmploymentType) => {
        if (responseAfteraddingEmploymentType.id) {
            return res
                .status(201)
                .json({ message: employementTypesMessages_1.EMPLOYMENT_TYPE_SUCCESS_MESSAGES.EMPLOYMENT_TYPE_ADD_SUCCESS_MESSAGE });
        }
        else {
            return res
                .status(400)
                .json({ message: employementTypesMessages_1.EMPLOYMENT_TYPE_ERRORS_MESSAGES.EMPLOYMENT_TYPE_ADD_ERROR_MESSAGE });
        }
    })
        .catch((error) => {
        console.error(error);
        return res.status(500).json({ message: employementTypesMessages_1.EMPLOYMENT_TYPE_ERRORS_MESSAGES.EMPLOYMENT_TYPE_UNEXPECTED_ERROR_MESSAGE });
    });
};
exports.default = { addEmploymentTypeByAdmin };
