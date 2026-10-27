"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateCompanyByRecruiterService_1 = __importDefault(require("../../services/recruiter/updateCompanyByRecruiterService"));
const recruiterErrorMessages_1 = require("../../constants/recruiterErrorMessages");
const updateCompanyByRecruiter = (req, res) => {
    updateCompanyByRecruiterService_1.default
        .updatePoolCompanyDetails(req.body)
        .then((responseAfterPoolCompanyUpdated) => {
        if (responseAfterPoolCompanyUpdated.success) {
            res.status(200).json({ success: true });
        }
        else {
            res.status(401).json({ success: false, message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_UPDATING_POOL_COMPANY_DETAILS });
        }
    })
        .catch((error) => {
        console.error(`Error while updating pool company details at controller level: ${error}`);
        res.status(500).json({ success: false, message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_UPDATING_POOL_COMPANY_DETAILS });
    });
};
exports.default = { updateCompanyByRecruiter };
