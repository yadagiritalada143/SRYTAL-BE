"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const talentPoolCandidatesModel_1 = __importDefault(require("../../model/talentPoolCandidatesModel"));
const getAllTalentPoolCandidatesService = () => {
    return new Promise((resolve, reject) => {
        talentPoolCandidatesModel_1.default.find({})
            .then((talentPoolCandidates) => {
            if (!talentPoolCandidates) {
                reject({ success: false });
            }
            else {
                resolve({
                    success: true,
                    talentPoolCandidatesList: talentPoolCandidates
                });
            }
        })
            .catch((error) => {
            console.error('Error in fetching talent pool candidates details:', error);
            reject({ success: false });
        });
    });
};
exports.default = { getAllTalentPoolCandidatesService };
