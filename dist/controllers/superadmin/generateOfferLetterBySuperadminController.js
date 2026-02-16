"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generateOfferLetterBySuperadminService_1 = __importDefault(require("../../services/superadmin/generateOfferLetterBySuperadminService"));
const generateOfferLetterBySuperadmin = async (req, res) => {
    try {
        const { nameOfTheCandidate, subject, role, dateOfJoining, compensation, workLocation } = req.body;
        if (!nameOfTheCandidate || !subject || !role || !dateOfJoining || !compensation || !workLocation) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        await generateOfferLetterBySuperadminService_1.default.generateOfferLetterBySuperadmin(res, nameOfTheCandidate, subject, role, dateOfJoining, compensation, workLocation);
    }
    catch (error) {
        console.error(`Error generating offer letter: ${error}`);
        res.status(500).json({ message: 'Error generating offer letter by superadmin.' });
    }
};
exports.default = { generateOfferLetterBySuperadmin };
