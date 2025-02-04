"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const recruiterErrorMessages_1 = require("../../constants/recruiterErrorMessages");
const getTalentPoolCandidateByIdService_1 = __importDefault(require("../../services/recruiter/getTalentPoolCandidateByIdService"));
const getTalentPoolCandidateDetailsByRecruiter = (req, res) => {
    const talentPoolCandidateId = req.params.id;
    getTalentPoolCandidateByIdService_1.default
        .getTalentPoolCandidateDetails(talentPoolCandidateId)
        .then(getTalentPoolCandidateDetailsResponse => {
        res.status(200).json(getTalentPoolCandidateDetailsResponse);
    })
        .catch(error => {
        console.error(`Error in fetching talent pool candidate details:${error} `);
        res.status(500).json({ success: false, message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_FETCHING_POOL_CANDIDATE_DETAILS });
    });
};
exports.default = { getTalentPoolCandidateDetailsByRecruiter };
