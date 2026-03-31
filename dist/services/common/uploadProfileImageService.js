"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../../model/userModel"));
const updateProfileImageDetails = async (fileNameToUpload, userIdToUpdate) => {
    try {
        const user = await userModel_1.default.findByIdAndUpdate(userIdToUpdate, {
            profileImage: fileNameToUpload,
        }, { new: true });
        return { success: true };
    }
    catch (error) {
        console.error(`Error while updating the profile image: ${error}`);
        return { success: false, error: error };
    }
};
exports.default = { updateProfileImageDetails };
