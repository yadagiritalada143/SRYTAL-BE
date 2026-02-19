"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteFeedbackAttributeByAdminService_1 = __importDefault(require("../../services/admin/deleteFeedbackAttributeByAdminService"));
const feedbackAttributeMessages_1 = require("../../constants/admin/feedbackAttributeMessages");
const deleteFeedbackAttributeByAdminController = async (req, res) => {
    try {
        const id = req.params.id;
        const deleteResult = await deleteFeedbackAttributeByAdminService_1.default.deleteFeedbackAttributeByAdminService(id);
        if (deleteResult.success) {
            return res.status(feedbackAttributeMessages_1.HTTP_STATUS.OK).json({ success: true, message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES.FEEDBACK_ATTRIBUTE_DELETE_SUCCESS_MESSAGE, data: deleteResult });
        }
        else {
            return res.status(feedbackAttributeMessages_1.HTTP_STATUS.NOT_FOUND).json({ success: false, message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_NOT_FOUND_ERROR_MESSAGE });
        }
    }
    catch (error) {
        console.error(`Error in deleting feedback attribute: ${error}`);
        return res.status(feedbackAttributeMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_DELETE_ERROR_MESSAGE });
    }
};
exports.default = { deleteFeedbackAttributeByAdminController };
