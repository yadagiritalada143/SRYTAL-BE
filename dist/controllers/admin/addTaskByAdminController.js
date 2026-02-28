"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addTaskByAdminService_1 = __importDefault(require("../../services/admin/addTaskByAdminService"));
const taskMessages_1 = require("../../constants/admin/taskMessages");
const addTaskByAdminController = (req, res) => {
    var _a;
    let taskDetails = req.body;
    taskDetails.createdAt = new Date();
    taskDetails.lastUpdatedAt = new Date();
    taskDetails.createdBy = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    taskDetails.isDeleted = false;
    addTaskByAdminService_1.default
        .addTaskByAdmin(taskDetails)
        .then((responseAfteraddingTask) => {
        res.status(200).json(responseAfteraddingTask);
    })
        .catch((error) => {
        console.error(`Error while adding Tasks: ${error}`);
        res.status(500).json({ success: false, message: taskMessages_1.TASK_ERROR_MESSAGES.TASK_ADD_ERROR_MESSAGE });
    });
};
exports.default = { addTaskByAdminController };
