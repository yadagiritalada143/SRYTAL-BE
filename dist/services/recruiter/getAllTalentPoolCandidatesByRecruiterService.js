"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const talentPoolCandidatesModel_1 = __importDefault(require("../../model/talentPoolCandidatesModel"));
const getAllTalentPoolCandidatesService = () => {
    return new Promise((resolve, reject) => {
        talentPoolCandidatesModel_1.default
            .find({})
            .populate('comments.userId', 'firstName lastName')
            .populate('createdBy', 'firstName lastName')
            .then((talentPoolCandidates) => {
            if (!talentPoolCandidates || talentPoolCandidates.length === 0) {
                return reject({ success: false });
            }
            talentPoolCandidates = talentPoolCandidates.map((candidate) => {
                if (Array.isArray(candidate.comments)) {
                    candidate.comments = candidate.comments
                        .map((comment) => (Object.assign(Object.assign({}, comment), { updateAt: new Date(comment.updateAt).getTime() || 0 })))
                        .sort((a, b) => b.updateAt - a.updateAt);
                }
                return candidate;
            });
            talentPoolCandidates.sort((a, b) => {
                var _a, _b, _c, _d;
                const latestCommentA = ((_b = (_a = a.comments) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.updateAt) || 0;
                const latestCommentB = ((_d = (_c = b.comments) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.updateAt) || 0;
                return latestCommentB - latestCommentA;
            });
            resolve({
                success: true,
                talentPoolCandidatesList: talentPoolCandidates,
            });
        })
            .catch((error) => {
            console.error('Error in fetching talent pool candidates details:', error);
            reject({ success: false });
        });
    });
};
exports.default = { getAllTalentPoolCandidatesService };
