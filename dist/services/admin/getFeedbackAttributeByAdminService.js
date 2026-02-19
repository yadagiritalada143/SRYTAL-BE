"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const feedbackAttributesModel_1 = __importDefault(require("../../model/feedbackAttributesModel"));
const getFeedbackAttributeByAdminService = async (id) => {
    try {
        const feedbackAttributeDetails = await feedbackAttributesModel_1.default.findOne({ _id: id });
        return feedbackAttributeDetails;
    }
    catch (error) {
        throw new Error('Error in fetching feedback attribute details');
    }
};
exports.default = { getFeedbackAttributeByAdminService };
