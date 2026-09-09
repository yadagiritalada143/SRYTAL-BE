"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../../model/userModel"));
const hardDeleteEmployeeProfileByAdmin = async (userIdToDelete) => {
    return new Promise(async (resolve, reject) => {
        const result = await userModel_1.default.deleteOne({ _id: userIdToDelete })
            .then((responseAfterProfileHardDelete) => {
            resolve({ success: true });
        })
            .catch((error) => {
            console.error(`Error in hard deleting Profile: ${error}`);
            reject({ success: false });
        });
    });
};
const softDeleteEmployeeProfileByAdmin = async (userIdToDelete) => {
    return new Promise(async (resolve, reject) => {
        const result = await userModel_1.default.updateOne({ _id: userIdToDelete }, { isDeleted: true })
            .then((responseAfterProfileSoftDelete) => {
            resolve({ success: true });
        })
            .catch((error) => {
            console.error(`Error in soft deleting Profile: ${error}`);
            reject({ success: false });
        });
    });
};
exports.default = { hardDeleteEmployeeProfileByAdmin, softDeleteEmployeeProfileByAdmin };
