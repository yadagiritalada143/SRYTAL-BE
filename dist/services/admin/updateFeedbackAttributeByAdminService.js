"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const feedbackAttributesModel_1 = __importDefault(require("../../model/feedbackAttributesModel"));
const updateFeedbackAttributeByAdminService = async (id, name) => {
    try {
        const result = await feedbackAttributesModel_1.default.updateOne({ _id: id }, { name });
        if (result) {
            return { success: true, responseAfterupdate: result };
        }
        else {
            return { success: false };
        }
    }
    catch (error) {
        console.error(`Error in updating feedback attribute: ${error}`);
        throw error;
    }
};
exports.default = { updateFeedbackAttributeByAdminService };
