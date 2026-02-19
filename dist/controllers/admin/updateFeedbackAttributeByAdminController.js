"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateFeedbackAttributeByAdminService_1 = __importDefault(require("../../services/admin/updateFeedbackAttributeByAdminService"));
const feedbackAttributeMessages_1 = require("../../constants/admin/feedbackAttributeMessages");
const updateFeedbackAttributeByAdminController = async (req, res) => {
    try {
        const { id, name } = req.body;
        await updateFeedbackAttributeByAdminService_1.default.updateFeedbackAttributeByAdminService(id, name);
        return res.status(feedbackAttributeMessages_1.HTTP_STATUS.OK).json({ success: true, message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES.FEEDBACK_ATTRIBUTE_UPDATE_SUCCESS_MESSAGE });
    }
    catch (error) {
        console.error(`Error updating feedback attribute: ${error}`);
        return res.status(feedbackAttributeMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_UPDATE_ERROR_MESSAGE });
    }
};
exports.default = { updateFeedbackAttributeByAdminController };
