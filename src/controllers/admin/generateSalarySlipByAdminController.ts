import { Request, Response } from 'express';
import generateSalarySlipByAdminService from '../../services/admin/generateSalarySlipByAdminService';
import { SALARY_SLIP_SUCCESS_MESSAGES, SALARY_SLIP_ERROR_MESSAGES } from '../../constants/admin/salarySlipMessages';
import { ISalarySlipRequest } from '../../interfaces/salarySlip';

const generateSalarySlip = async (req: Request, res: Response) => {
    try {
        const salarySlipRequest: ISalarySlipRequest = req.body;

        if (!salarySlipRequest.employeeId || !salarySlipRequest.employeeName || !salarySlipRequest.basicSalary) {
            return res.status(400).json({
                success: false,
                message: SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_MISSING_REQUIRED_FIELDS,
            });
        }

        const result = await generateSalarySlipByAdminService.generateSalarySlipPDF(salarySlipRequest);

        if (result.success && result.pdfBuffer) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
            res.setHeader('Content-Length', result.pdfBuffer.length);

            return res.send(result.pdfBuffer);
        } else {
            return res.status(400).json({
                success: false,
                message: result.error || SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_GENERATION_FAILED,
            });
        }
    } catch (error: any) {
        console.error('Error in generateSalarySlip controller:', error);
        return res.status(500).json({
            success: false,
            message: SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_UNEXPECTED_ERROR,
            error: error.message,
        });
    }
};

const previewSalarySlip = async (req: Request, res: Response) => {
    try {
        const salarySlipRequest: ISalarySlipRequest = req.body;

        if (!salarySlipRequest.employeeId || !salarySlipRequest.employeeName || !salarySlipRequest.basicSalary) {
            return res.status(400).json({
                success: false,
                message: SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_MISSING_REQUIRED_FIELDS,
            });
        }

        const result = await generateSalarySlipByAdminService.generateSalarySlipPDF(salarySlipRequest);

        if (result.success && result.pdfBuffer) {
            return res.status(200).json({
                success: true,
                message: SALARY_SLIP_SUCCESS_MESSAGES.SALARY_SLIP_GENERATED_SUCCESS,
                data: {
                    fileName: result.fileName,
                    pdfBase64: result.pdfBuffer.toString('base64'),
                    calculations: result.calculations,
                },
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.error || SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_GENERATION_FAILED,
            });
        }
    } catch (error: any) {
        console.error('Error in previewSalarySlip controller:', error);
        return res.status(500).json({
            success: false,
            message: SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_UNEXPECTED_ERROR,
            error: error.message,
        });
    }
};

export default { generateSalarySlip, previewSalarySlip };
