"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const talentPoolCandidatesModel_1 = __importDefault(require("../../model/talentPoolCandidatesModel"));
const addTalentPoolCandidatesByRecruiter = async (detailsOfPoolCandidateToTracker) => {
    try {
        const talentPoolCandidateDataToSave = new talentPoolCandidatesModel_1.default(Object.assign({}, detailsOfPoolCandidateToTracker));
        const result = await talentPoolCandidateDataToSave.save();
        return result;
    }
    catch (error) {
        console.error('Error in adding candidates to talent pool tracker details:', error);
        return { success: false };
    }
};
exports.default = { addTalentPoolCandidatesByRecruiter };
