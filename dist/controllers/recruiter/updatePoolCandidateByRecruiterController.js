"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updatePoolCandidateByRecruiterService_1 = __importDefault(require("../../services/recruiter/updatePoolCandidateByRecruiterService"));
const recruiterErrorMessages_1 = require("../../constants/recruiterErrorMessages");
const updatePoolCandidateByRecruiter = (req, res) => {
    updatePoolCandidateByRecruiterService_1.default
        .updatePoolCandidateDetails(req.body)
        .then((responseAfterPoolCandidateUpdated) => {
        if (responseAfterPoolCandidateUpdated.success) {
            res.status(200).json({ success: true });
        }
        else {
            res.status(401).json({ success: false, message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_UPDATING_POOL_CANDIDATE_DETAILS });
        }
    })
        .catch((error) => {
        console.error(`Error while updating pool candidate details at controller level: ${error}`);
        res.status(500).json({ success: false, message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_UPDATING_POOL_CANDIDATE_DETAILS });
    });
};
exports.default = { updatePoolCandidateByRecruiter };
