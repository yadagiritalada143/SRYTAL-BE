"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const feedbackAttributesModel_1 = __importDefault(require("../../model/feedbackAttributesModel"));
const deleteFeedbackAttributeByAdminService = async (id) => {
    try {
        const result = await feedbackAttributesModel_1.default.findByIdAndDelete(id);
        if (result) {
            return { success: true, responseAfterDelete: result };
        }
        else {
            return { success: false };
        }
    }
    catch (error) {
        console.error(`Error in deleting feedback attribute: ${error}`);
        return { success: false };
    }
};
exports.default = { deleteFeedbackAttributeByAdminService };
