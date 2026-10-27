"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deletePoolCompanyByAdminService_1 = __importDefault(require("../../services/admin/deletePoolCompanyByAdminService"));
const manageUserMessages_1 = require("../../constants/admin/manageUserMessages");
const deletePoolCompanyByAdmin = (req, res) => {
    const { confirmDelete } = req.body;
    const { id } = req.params;
    if (confirmDelete) {
        deletePoolCompanyByAdminService_1.default
            .hardDeletePoolCompanyByAdmin(id)
            .then((deletePoolCompanyResponse) => {
            res.status(200).json(deletePoolCompanyResponse);
        })
            .catch((error) => {
            console.error(`Error in (soft) deleting pool company: ${error}`);
            res.status(500).json({ success: false, message: manageUserMessages_1.DELETE_POOL_COMPANY_ERROR_MESSAGE.DELETE_POOL_COMPANY_SOFT_DELETE_ERROR_MESSAGE });
        });
    }
    else {
        deletePoolCompanyByAdminService_1.default
            .softDeletePoolCompanyByAdmin(id)
            .then((deletePoolCompanyResponse) => {
            res.status(200).json(deletePoolCompanyResponse);
        })
            .catch((error) => {
            console.error(`Error in (hard)  deleting pool company: ${error}`);
            res.status(500).json({ success: false, message: manageUserMessages_1.DELETE_POOL_COMPANY_ERROR_MESSAGE.DELETE_POOL_COMPANY_HARD_DELETE_ERROR_MESSAGE });
        });
    }
};
exports.default = { deletePoolCompanyByAdmin };
