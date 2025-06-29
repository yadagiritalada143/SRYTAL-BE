"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addTaskByAdminService_1 = __importDefault(require("../../services/admin/addTaskByAdminService"));
const taskMessages_1 = require("../../constants/admin/taskMessages");
const addTaskByAdminController = (req, res) => {
    let taskDetails = req.body;
    taskDetails.createdAt = new Date();
    taskDetails.lastUpdatedAt = new Date();
    taskDetails.createdBy = req.body.userId;
    taskDetails.isDeleted = false;
    addTaskByAdminService_1.default
        .addTaskByAdmin(taskDetails)
        .then((responseAfteraddingTask) => {
        res.status(200).json(responseAfteraddingTask);
    })
        .catch((error) => {
        console.log(`Error while adding Tasks: ${error}`);
        res.status(500).json({ success: false, message: taskMessages_1.TASK_ERROR_MESSAGES.TASK_ADD_ERROR_MESSAGE });
    });
};
exports.default = { addTaskByAdminController };
