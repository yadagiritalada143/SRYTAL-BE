"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bloodGroupModel_1 = __importDefault(require("../../model/bloodGroupModel"));
const deleteBloodGroupByAdmin = async (id) => {
    try {
        const result = await bloodGroupModel_1.default.findByIdAndDelete({ _id: id });
        if (result) {
            return { success: true, responseAfterDelete: result };
        }
        else {
            return { success: false };
        }
    }
    catch (error) {
        console.error(`Error in  deleting blood group: ${error}`);
        return { success: false, responseAfterDelete: error };
    }
};
exports.default = { deleteBloodGroupByAdmin };
