"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const expertConsultationModel_1 = __importDefault(require("../../model/expertConsultationModel"));
const customerConsultationEmail_1 = __importDefault(require("../../util/customerConsultationEmail"));
const ExpertConsultationService = async (fullName, email, phoneNumber, company, projectBudget, timeline) => {
    try {
        const consultation = new expertConsultationModel_1.default({ fullName, email, phoneNumber, company, projectBudget, timeline });
        await consultation.save();
        await Promise.all([
            customerConsultationEmail_1.default.sendCustomerThankYouEmail(consultation),
            customerConsultationEmail_1.default.sendAdminNotificationEmail(consultation),
        ]);
        return consultation;
    }
    catch (error) {
        throw new Error(`Error creating expert consultation: ${error}`);
    }
};
exports.default = { ExpertConsultationService };
