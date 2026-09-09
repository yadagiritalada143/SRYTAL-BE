"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const taskModel_1 = __importDefault(require("../../model/taskModel"));
const updateTaskByAdmin = async (taskDetails) => {
    try {
        const result = await taskModel_1.default.updateOne({ _id: taskDetails.id }, Object.assign({}, taskDetails));
        if (result) {
            return { success: true, responseAfterUpdate: result };
        }
        else {
            return { success: false };
        }
    }
    catch (error) {
        console.error(`Error in updating task: ${error}`);
        return { success: false, responseAfterUpdate: error };
    }
};
exports.default = { updateTaskByAdmin };
