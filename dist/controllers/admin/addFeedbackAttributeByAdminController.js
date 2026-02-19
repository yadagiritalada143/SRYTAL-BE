"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addFeedbackAttributeByAdminService_1 = __importDefault(require("../../services/admin/addFeedbackAttributeByAdminService"));
const feedbackAttributeMessages_1 = require("../../constants/admin/feedbackAttributeMessages");
const addFeedbackAttributeByAdminController = async (req, res) => {
    try {
        const { name } = req.body;
        await addFeedbackAttributeByAdminService_1.default.addFeedbackAttributeByAdminService(name);
        return res.status(feedbackAttributeMessages_1.HTTP_STATUS.OK).json({ success: true, message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES.FEEDBACK_ATTRIBUTE_ADD_SUCCESS_MESSAGE });
    }
    catch (error) {
        console.error(`Error while adding feedback attribute: ${error}`);
        return res.status(feedbackAttributeMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_ADD_ERROR_MESSAGE });
    }
};
exports.default = { addFeedbackAttributeByAdminController };
