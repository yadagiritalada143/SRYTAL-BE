"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deletePoolCandidatesByAdminService_1 = __importDefault(require("../../services/admin/deletePoolCandidatesByAdminService"));
const manageUserMessages_1 = require("../../constants/admin/manageUserMessages");
const deletePoolCandidateByAdmin = (req, res) => {
    const { confirmDelete } = req.body;
    const { id } = req.params;
    if (confirmDelete) {
        deletePoolCandidatesByAdminService_1.default
            .hardDeletePoolCandidateByAdmin(id)
            .then((deletePoolCandidateResponse) => {
            res.status(200).json(deletePoolCandidateResponse);
        })
            .catch((error) => {
            console.error(`Error in (soft) deleting pool candidate: ${error}`);
            res.status(500).json({ success: false, message: manageUserMessages_1.DELETE_ERROR_MESSAGES.DELETE_POOL_CANDIDATE_SOFT_DELETE_ERROR_MESSAGE });
        });
    }
    else {
        deletePoolCandidatesByAdminService_1.default
            .softDeletePoolCandidateByAdmin(id)
            .then((deletePoolCandidateResponse) => {
            res.status(200).json(deletePoolCandidateResponse);
        })
            .catch((error) => {
            console.error(`Error in (hard)  deleting pool candidate: ${error}`);
            res.status(500).json({ success: false, message: manageUserMessages_1.DELETE_ERROR_MESSAGES.DELETE_POOL_CANDIDATE_HARD_DELETE_ERROR_MESSAGE });
        });
    }
};
exports.default = { deletePoolCandidateByAdmin };
