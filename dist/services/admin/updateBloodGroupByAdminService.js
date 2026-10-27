"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bloodGroupModel_1 = __importDefault(require("../../model/bloodGroupModel"));
const updateBloodGroupByAdmin = async (id, type) => {
    try {
        const result = await bloodGroupModel_1.default.updateOne({ _id: id }, { type });
        if (result) {
            return { success: true, responseAfterupdate: result };
        }
        else {
            return { success: false };
        }
    }
    catch (error) {
        console.error(`Error in  updating blood group: ${error}`);
        return { success: false, responseAfterupdate: error };
    }
};
exports.default = { updateBloodGroupByAdmin };
