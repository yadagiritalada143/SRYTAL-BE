"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllFeedbackAttributeByAdminService_1 = __importDefault(require("../../services/admin/getAllFeedbackAttributeByAdminService"));
const feedbackAttributeMessages_1 = require("../../constants/admin/feedbackAttributeMessages");
const getAllFeedbackAttributesByAdminController = async (req, res) => {
    try {
        const feedbackAttributes = await getAllFeedbackAttributeByAdminService_1.default.getAllFeedbackAttributeByAdminService();
        return res.status(feedbackAttributeMessages_1.HTTP_STATUS.OK).json({ success: true, message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES.FETCH_ALL_FEEDBACK_ATTRIBUTES_SUCCESS_MESSAGE, data: feedbackAttributes });
    }
    catch (error) {
        console.error(`Error fetching feedback attributes: ${error}`);
        return res.status(feedbackAttributeMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FETCH_ALL_FEEDBACK_ATTRIBUTES_ERROR_MESSAGE });
    }
};
exports.default = { getAllFeedbackAttributesByAdminController };
