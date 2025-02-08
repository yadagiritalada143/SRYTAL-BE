"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const userModel_1 = __importDefault(require("../model/userModel"));
const TalentPoolCandidatesSchema = new mongoose_1.default.Schema({
    id: { type: mongoose_1.default.Schema.Types.ObjectId },
    candidateName: { type: mongoose_1.default.Schema.Types.String, required: true },
    contact: {
        email: { type: mongoose_1.default.Schema.Types.String, required: true, unique: true },
        phone: { type: mongoose_1.default.Schema.Types.String, required: true, unique: true }
    },
    totalYearsOfExperience: { type: mongoose_1.default.Schema.Types.Number },
    relaventYearsOfExperience: { type: mongoose_1.default.Schema.Types.Number },
    evaluatedSkills: { type: mongoose_1.default.Schema.Types.String },
    comments: [{
            userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: userModel_1.default },
            callStartsAt: { type: mongoose_1.default.Schema.Types.Date },
            callEndsAt: { type: mongoose_1.default.Schema.Types.Date },
            comment: { type: mongoose_1.default.Schema.Types.String },
            updateAt: { type: mongoose_1.default.Schema.Types.Date }
        }],
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: userModel_1.default },
    createdAt: { type: mongoose_1.default.Schema.Types.Date },
    lastUpdatedAt: { type: mongoose_1.default.Schema.Types.Date }
}, {
    collection: 'talent-pool-candidates',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
TalentPoolCandidatesSchema.plugin(mongoose_unique_validator_1.default);
const TalentPoolCandidatesModel = mongoose_1.default.model('TalentPoolCandidatesSchema', TalentPoolCandidatesSchema);
exports.default = TalentPoolCandidatesModel;
