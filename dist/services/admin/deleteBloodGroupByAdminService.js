"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bloodGroupModel_1 = __importDefault(require("../../model/bloodGroupModel"));
const deleteBloodGroupByAdmin = async (bloodGroupId) => {
    try {
        const deleteResult = await bloodGroupModel_1.default.deleteOne({ _id: bloodGroupId });
        if (!deleteResult) {
            return { success: false };
        }
        return { success: true };
    }
    catch (error) {
        console.error('Error deleting blood group:', error);
        return { success: false };
    }
};
exports.default = { deleteBloodGroupByAdmin };
