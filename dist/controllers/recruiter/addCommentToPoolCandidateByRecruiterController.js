"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addCommentToPoolCandidateByRecruiterService_1 = __importDefault(require("../../services/recruiter/addCommentToPoolCandidateByRecruiterService"));
const recruiterErrorMessages_1 = require("../../constants/recruiterErrorMessages");
const addCommentToPoolCandidateByRecruiter = (req, res) => {
    addCommentToPoolCandidateByRecruiterService_1.default
        .addCommentToPoolCandidateByRecruiter(req.body)
        .then((responseAfterCommentAdded) => {
        if (responseAfterCommentAdded && responseAfterCommentAdded.comments) {
            responseAfterCommentAdded.comments.sort((a, b) => b.updateAt - a.updateAt);
        }
        res.status(200).json({ responseAfterCommentAdded });
    })
        .catch((error) => {
        console.error(`Error in updating comment for pool candidate: ${error}`);
        res.status(500).json({ success: false, message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_ADDING_COMMENT_TO_POOL_CANDIDATE });
    });
};
exports.default = { addCommentToPoolCandidateByRecruiter };
