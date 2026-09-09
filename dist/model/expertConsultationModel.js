"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const ExpertConsultationSchema = new mongoose_1.default.Schema({
    fullName: { type: mongoose_1.default.Schema.Types.String, required: true, },
    email: { type: mongoose_1.default.Schema.Types.String, required: true },
    phoneNumber: { type: mongoose_1.default.Schema.Types.String, required: true },
    company: { type: mongoose_1.default.Schema.Types.String },
    projectBudget: { type: mongoose_1.default.Schema.Types.String, required: true },
    timeline: { type: mongoose_1.default.Schema.Types.String, required: true },
    createdAt: { type: mongoose_1.default.Schema.Types.Date, default: Date.now },
    updatedAt: { type: mongoose_1.default.Schema.Types.Date, default: Date.now },
}, {
    collection: 'expert-consultations',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
ExpertConsultationSchema.plugin(mongoose_unique_validator_1.default);
const ExpertConsultation = mongoose_1.default.model('ExpertConsultation', ExpertConsultationSchema);
exports.default = ExpertConsultation;
