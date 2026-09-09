"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bloodGroupModel_1 = __importDefault(require("../../model/bloodGroupModel"));
const addBloodgroupByAdmin = async (addBloodgroup) => {
    try {
        const bloodgroupDataToSave = new bloodGroupModel_1.default({ type: addBloodgroup });
        const result = await bloodgroupDataToSave.save();
        return result;
    }
    catch (error) {
        console.error(`Error in adding Blood Group details: ${error}`);
        return { success: false };
    }
};
exports.default = { addBloodgroupByAdmin };
