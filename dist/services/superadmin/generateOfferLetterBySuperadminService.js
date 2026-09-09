"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pdfkit_1 = __importDefault(require("pdfkit"));
const generateOfferLetterBySuperadmin = async (res, nameOfTheCandidate, subject, role, dateOfJoining, compensation, workLocation) => {
    const doc = new pdfkit_1.default();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${nameOfTheCandidate}_OfferLetter.pdf`);
    doc.pipe(res);
    doc.fontSize(20).text('Offer Letter', { align: 'center' }).moveDown();
    doc
        .fontSize(12)
        .text(`Dear ${nameOfTheCandidate},`, { align: 'left' })
        .moveDown();
    doc
        .text(`Subject: ${subject}\n\nWe are pleased to offer you the role of "${role}" at our organization. Your employment is expected to commence on ${dateOfJoining}.`)
        .moveDown();
    doc
        .text(`As part of this role, your annual compensation will be ${compensation}. You will be working from our office located at ${workLocation}.`)
        .moveDown();
    doc
        .text(`We are excited to have you join our team and look forward to your valuable contributions. Please reach out to us if you have any questions.`)
        .moveDown();
    doc.text('Best regards,').moveDown();
    doc.text('The HR Team').moveDown();
    doc.end();
};
exports.default = { generateOfferLetterBySuperadmin };
