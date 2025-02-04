"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addTalentPoolCandidateByRecruiterService_1 = __importDefault(require("../../services/recruiter/addTalentPoolCandidateByRecruiterService"));
const recruiterErrorMessages_1 = require("../../constants/recruiterErrorMessages");
const addTalentPoolCandidateByRecruiter = (req, res) => {
    var _a;
    let candidateDetails = req.body;
    candidateDetails.createdAt = new Date();
    candidateDetails.lastUpdatedAt = new Date();
    if ((_a = candidateDetails === null || candidateDetails === void 0 ? void 0 : candidateDetails.comments) === null || _a === void 0 ? void 0 : _a.length) {
        candidateDetails.comments.map((comment) => {
            comment.userId = candidateDetails.userId;
            comment.updateAt = new Date();
        });
    }
    addTalentPoolCandidateByRecruiterService_1.default
        .addTalentPoolCandidatesByRecruiter(candidateDetails)
        .then((responseAfterCandidateAdded) => {
        res.status(200).json({ responseAfterCandidateAdded });
    })
        .catch((error) => {
        console.error(`Error in adding talent pool to tracker: ${error}`);
        res.status(500).json({ success: false, message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_ADDING_POOL_CANDIDATE_DETAILS });
    });
};
exports.default = { addTalentPoolCandidateByRecruiter };
