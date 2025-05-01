"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteTaskByAdminService_1 = __importDefault(require("../../services/admin/deleteTaskByAdminService"));
const taskMessages_1 = require("../../constants/admin/taskMessages");
const deleteTaskByAdmin = (req, res) => {
    const { confirmDelete } = req.body;
    const { id } = req.params;
    if (confirmDelete) {
        deleteTaskByAdminService_1.default
            .hardDeleteTaskByAdmin(id)
            .then((deletePackageResponse) => {
            res.status(200).json(deletePackageResponse);
        })
            .catch((error) => {
            console.error(`Error in (hard) deleting task: ${error}`);
            res.status(500).json({ success: false, message: taskMessages_1.TASK_ERROR_MESSAGES.TASK_HARD_DELETE_ERROR_MESSAGE });
        });
    }
    else {
        deleteTaskByAdminService_1.default
            .softDeleteTaskByAdmin(id)
            .then((deletePackageResponse) => {
            res.status(200).json(deletePackageResponse);
        })
            .catch((error) => {
            console.error(`Error in (soft)  deleting task: ${error}`);
            res.status(500).json({ success: false, message: taskMessages_1.TASK_ERROR_MESSAGES.TASK_SOFT_DELETE_ERROR_MESSAGE });
        });
    }
};
exports.default = { deleteTaskByAdmin };
