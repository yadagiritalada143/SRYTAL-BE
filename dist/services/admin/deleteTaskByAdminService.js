"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const taskModel_1 = __importDefault(require("../../model/taskModel"));
const hardDeleteTaskByAdmin = async (taskIdToDelete) => {
    return new Promise(async (resolve, reject) => {
        await taskModel_1.default.deleteOne({ _id: taskIdToDelete })
            .then((responseAfterHardDeletingTask) => {
            resolve({ success: true });
        })
            .catch((error) => {
            console.error(`Error in hard deleting task: ${error}`);
            reject({ success: false });
        });
    });
};
const softDeleteTaskByAdmin = async (taskIdToDelete) => {
    return new Promise(async (resolve, reject) => {
        await taskModel_1.default.updateOne({ _id: taskIdToDelete }, { isDeleted: true })
            .then((responseAfterSoftDeletingTask) => {
            resolve({ success: true });
        })
            .catch((error) => {
            console.error(`Error in soft deleting task: ${error}`);
            reject({ success: false });
        });
    });
};
exports.default = { hardDeleteTaskByAdmin, softDeleteTaskByAdmin };
