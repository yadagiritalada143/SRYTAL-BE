"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const feedbackAttributesModel_1 = __importDefault(require("../../model/feedbackAttributesModel"));
const getAllFeedbackAttributeByAdminService = async () => {
    const getallfeedbacks = await feedbackAttributesModel_1.default.find();
    const feedbackAttributes = getallfeedbacks.map((feedbackAttribute) => ({
        id: feedbackAttribute.id,
        name: feedbackAttribute.name,
    }));
    return { success: true, feedbackAttributeResponse: feedbackAttributes };
};
exports.default = { getAllFeedbackAttributeByAdminService };
