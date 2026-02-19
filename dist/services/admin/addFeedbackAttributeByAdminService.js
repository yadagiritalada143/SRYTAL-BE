"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const feedbackAttributesModel_1 = __importDefault(require("../../model/feedbackAttributesModel"));
const addFeedbackAttributeByAdminService = async (name) => {
    try {
        const createdAttribute = new feedbackAttributesModel_1.default({ name });
        const result = await createdAttribute.save();
        return result;
    }
    catch (error) {
        console.error(`Error while adding feedback attribute: ${error}`);
        throw new Error('An error occurred while adding feedback attribute.');
    }
};
exports.default = { addFeedbackAttributeByAdminService };
