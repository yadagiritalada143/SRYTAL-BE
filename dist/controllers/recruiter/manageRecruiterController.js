"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const manageRecruiterService_1 = __importDefault(require("../../services/recruiter/manageRecruiterService"));
const recruiterErrorMessages_1 = require("../../constants/recruiterErrorMessages");
const getPoolCompanyDetails = (req, res) => {
    manageRecruiterService_1.default
        .getPoolCompanyDetails()
        .then((getPoolServicesResponse) => {
        res.status(200).json(getPoolServicesResponse);
    })
        .catch((error) => {
        console.error(`Error while fetching pool company details at controller level: ${error}`);
        res.status(500).json({ success: false, message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_FETCHING_POOL_COMPANY_DETAILS });
    });
};
const getPoolCompanyDetailsById = (req, res) => {
    const { id } = req.params;
    manageRecruiterService_1.default
        .getPoolCompanyDetailsById(id)
        .then((getPoolServicesResponse) => {
        res.status(200).json({ success: true, poolCompanyResponse: getPoolServicesResponse });
    })
        .catch((error) => {
        console.error(`Error while fetching pool company details at controller level: ${error}`);
        res.status(500).json({ success: false, message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_FETCHING_POOL_COMPANY_DETAILS });
    });
};
const addPoolCompany = (req, res) => {
    manageRecruiterService_1.default
        .addPoolCompany(req.body)
        .then((responseAfterPoolCompanyAdded) => {
        res.status(200).json({ success: true });
    })
        .catch((error) => {
        console.error(`Error while adding pool company details at controller level: ${error}`);
        res.status(500).json({ success: false, message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_ADDING_POOL_COMPANY_DETAILS });
    });
};
exports.default = { getPoolCompanyDetails, getPoolCompanyDetailsById, addPoolCompany };
