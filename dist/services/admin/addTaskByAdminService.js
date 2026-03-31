"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const taskModel_1 = __importDefault(require("../../model/taskModel"));
const addTaskByAdmin = async (data) => {
    const taskData = new taskModel_1.default(data);
    return await taskData.save();
};
exports.default = { addTaskByAdmin };
