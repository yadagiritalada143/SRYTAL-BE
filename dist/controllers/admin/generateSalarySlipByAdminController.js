"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generateSalarySlipByAdminService_1 = __importDefault(require("../../services/admin/generateSalarySlipByAdminService"));
const salarySlipMessages_1 = require("../../constants/admin/salarySlipMessages");
const sendSalarySlipNotificationEmail_1 = __importDefault(require("../../util/sendSalarySlipNotificationEmail"));
const generateSalarySlip = async (req, res) => {
    try {
        const salarySlipRequest = req.body;
        if (!salarySlipRequest.employeeId || !salarySlipRequest.employeeName || !salarySlipRequest.basicSalary || !salarySlipRequest.employeeEmail) {
            return res.status(salarySlipMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: salarySlipMessages_1.SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_MISSING_REQUIRED_FIELDS,
            });
        }
        const result = await generateSalarySlipByAdminService_1.default.generateSalarySlipPDF(salarySlipRequest);
        if (result.success && result.pdfBuffer) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
            res.setHeader('Content-Length', result.pdfBuffer.length);
            res.send(result.pdfBuffer);
            // Send salary slip notification email asynchronously (fire and forget)
            sendSalarySlipNotificationEmail_1.default.sendSalarySlipNotificationEmail({
                employeeName: salarySlipRequest.employeeName,
                employeeEmail: salarySlipRequest.employeeEmail,
                payPeriod: salarySlipRequest.payPeriod,
                payDate: salarySlipRequest.payDate,
            }).catch((error) => {
                console.error('Failed to send salary slip notification email:', error);
            });
            return;
        }
        else {
            return res.status(salarySlipMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: result.error || salarySlipMessages_1.SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_GENERATION_FAILED,
            });
        }
    }
    catch (error) {
        console.error('Error in generateSalarySlip controller:', error);
        return res.status(salarySlipMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: salarySlipMessages_1.SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_UNEXPECTED_ERROR,
            error: error.message,
        });
    }
};
const previewSalarySlip = async (req, res) => {
    try {
        const salarySlipRequest = req.body;
        if (!salarySlipRequest.employeeId || !salarySlipRequest.employeeName || !salarySlipRequest.basicSalary || !salarySlipRequest.employeeEmail) {
            return res.status(salarySlipMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: salarySlipMessages_1.SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_MISSING_REQUIRED_FIELDS,
            });
        }
        const result = await generateSalarySlipByAdminService_1.default.generateSalarySlipPDF(salarySlipRequest);
        if (result.success && result.pdfBuffer) {
            return res.status(salarySlipMessages_1.HTTP_STATUS.OK).json({
                success: true,
                message: salarySlipMessages_1.SALARY_SLIP_SUCCESS_MESSAGES.SALARY_SLIP_GENERATED_SUCCESS,
                data: {
                    fileName: result.fileName,
                    pdfBase64: result.pdfBuffer.toString('base64'),
                    calculations: result.calculations,
                },
            });
        }
        else {
            return res.status(salarySlipMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: result.error || salarySlipMessages_1.SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_GENERATION_FAILED,
            });
        }
    }
    catch (error) {
        console.error('Error in previewSalarySlip controller:', error);
        return res.status(salarySlipMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: salarySlipMessages_1.SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_UNEXPECTED_ERROR,
            error: error.message,
        });
    }
};
exports.default = { generateSalarySlip, previewSalarySlip };
