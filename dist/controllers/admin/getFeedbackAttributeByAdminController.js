"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getFeedbackAttributeByAdminService_1 = __importDefault(require("../../services/admin/getFeedbackAttributeByAdminService"));
const feedbackAttributeMessages_1 = require("../../constants/admin/feedbackAttributeMessages");
const getFeedbackAttributeByAdminController = async (req, res) => {
    try {
        const { id } = req.params;
        const feedbackAttributeDetails = await getFeedbackAttributeByAdminService_1.default.getFeedbackAttributeByAdminService(id);
        if (!feedbackAttributeDetails) {
            return res.status(feedbackAttributeMessages_1.HTTP_STATUS.NOT_FOUND).json({ success: false, message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_NOT_FOUND_ERROR_MESSAGE });
        }
        return res.status(feedbackAttributeMessages_1.HTTP_STATUS.OK).json({ success: true, message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES.FEEDBACK_ATTRIBUTE_FETCH_SUCCESS_MESSAGE, data: feedbackAttributeDetails });
    }
    catch (error) {
        console.error(`Error in fetching feedback attribute details: ${error}`);
        return res.status(feedbackAttributeMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_FETCH_ERROR_MESSAGE });
    }
};
exports.default = { getFeedbackAttributeByAdminController };
