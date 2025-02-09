"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const talentPoolCandidatesModel_1 = __importDefault(require("../../model/talentPoolCandidatesModel"));
const getTalentPoolCandidateDetails = (talentPoolCandidateId) => {
    return new Promise((resolve, reject) => {
        talentPoolCandidatesModel_1.default
            .findById({ _id: talentPoolCandidateId })
            .populate('comments.userId', 'firstName lastName')
            .then((talentPoolCandidateDetails) => {
            if (!talentPoolCandidateDetails) {
                reject({ success: false });
            }
            else {
                if (Array.isArray(talentPoolCandidateDetails.comments)) {
                    talentPoolCandidateDetails.comments = talentPoolCandidateDetails.comments
                        .map((comment) => (Object.assign(Object.assign({}, comment), { updateAt: new Date(comment.updateAt).getTime() || 0 })))
                        .sort((a, b) => b.updateAt - a.updateAt);
                }
                resolve({
                    success: true,
                    talentPoolCandidateDetails,
                });
            }
        })
            .catch((error) => {
            console.error('Error in fetching talent pool candidates details:', error);
            reject({ success: false });
        });
    });
};
exports.default = { getTalentPoolCandidateDetails };
