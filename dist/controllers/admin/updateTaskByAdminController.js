"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateTaskByAdminService_1 = __importDefault(require("../../services/admin/updateTaskByAdminService"));
const taskMessages_1 = require("../../constants/admin/taskMessages");
const updateTaskByAdminController = (req, res) => {
    const taskDetails = req.body;
    taskDetails.lastUpdatedBy = new Date();
    updateTaskByAdminService_1.default
        .updateTaskByAdmin(taskDetails)
        .then((updateTaskResponse) => {
        res.status(200).json(updateTaskResponse);
    })
        .catch((error) => {
        console.error(`Error in  updating task: ${error}`);
        res.status(500).json({ success: false, message: taskMessages_1.TASK_ERROR_MESSAGES.TASK_UPDATING_ERROR_MESSAGE });
    });
};
exports.default = { updateTaskByAdminController };
