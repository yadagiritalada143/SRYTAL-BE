"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const recruiterErrorMessages_1 = require("../../constants/recruiterErrorMessages");
const getAllTalentPoolCandidatesByRecruiterService_1 = __importDefault(require("../../services/recruiter/getAllTalentPoolCandidatesByRecruiterService"));
const getAllTalentPoolCandidatesByRecruiter = (req, res) => {
    getAllTalentPoolCandidatesByRecruiterService_1.default
        .getAllTalentPoolCandidatesService()
        .then(getAllTalentPoolCandidatesResponse => {
        res.status(200).json(getAllTalentPoolCandidatesResponse);
    })
        .catch(error => {
        console.error(`Error in fetching all talent pool candidates details:${error} `);
        res.status(500).json({ success: false, message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_FETCHING_POOL_CANDIDATE_DETAILS });
    });
};
exports.default = { getAllTalentPoolCandidatesByRecruiter };
