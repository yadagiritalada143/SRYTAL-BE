"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const expertConsultationService_1 = __importDefault(require("../../services/common/expertConsultationService"));
const expertConsultationMessage_1 = require("../../constants/common/expertConsultationMessage");
const createExpertConsultation = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, company, projectBudget, timeline } = req.body;
        const consultation = await expertConsultationService_1.default.ExpertConsultationService(fullName, email, phoneNumber, company, projectBudget, timeline);
        res.status(201).json({
            success: true,
            message: expertConsultationMessage_1.EXPERT_CONSULTATION_SUCCESS_MESSAGE.SUBMITTED_SUCCESSFULLY,
            data: consultation,
        });
    }
    catch (error) {
        console.error(`Create Expert Consultation Error: ${error}`);
        res.status(500).json({
            success: false,
            message: expertConsultationMessage_1.EXPERT_CONSULTATION_ERROR_MESSAGE.SUBMISSION_FAILED,
        });
    }
};
exports.default = { createExpertConsultation };
