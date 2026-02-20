import { Request, Response } from 'express';
import generateSalarySlipByAdminService from '../../services/admin/generateSalarySlipByAdminService';
import { SALARY_SLIP_SUCCESS_MESSAGES, SALARY_SLIP_ERROR_MESSAGES, HTTP_STATUS } from '../../constants/admin/salarySlipMessages';
import { ISalarySlipRequest } from '../../interfaces/salarySlip';
import sendSalarySlipNotificationEmail from '../../util/sendSalarySlipNotificationEmail';
import manageSalarySlips from '../../util/manageSalarySlips';

const generateSalarySlip = async (req: Request, res: Response) => {
    try {
        const salarySlipRequest: ISalarySlipRequest = req.body;

        if (!salarySlipRequest.employeeId || !salarySlipRequest.employeeName || !salarySlipRequest.basicSalary || !salarySlipRequest.employeeEmail) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_MISSING_REQUIRED_FIELDS,
            });
        }
        const result = await generateSalarySlipByAdminService.generateSalarySlipPDF(salarySlipRequest);

        if (result.success && result.pdfBuffer) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
            res.setHeader('Content-Length', result.pdfBuffer.length);
            res.send(result.pdfBuffer);

            // Send salary slip notification email asynchronously (fire and forget)
            sendSalarySlipNotificationEmail.sendSalarySlipNotificationEmail({
                employeeName: salarySlipRequest.employeeName,
                employeeEmail: salarySlipRequest.employeeEmail,
                payPeriod: salarySlipRequest.payPeriod,
                payDate: salarySlipRequest.payDate,
            }).catch((error) => {
                console.error('Failed to send salary slip notification email:', error);
            });

            manageSalarySlips.uploadSalarySlipToS3({
                mongoId: salarySlipRequest._id,
                employeeName: salarySlipRequest.employeeName,
                payPeriod: salarySlipRequest.payPeriod,
                pdfBuffer: result.pdfBuffer,
            }).catch((error) => {
                console.error('Failed to upload salary slip to S3:', error);
            });

            return;
        } else {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: result.error || SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_GENERATION_FAILED,
            });
        }
    } catch (error: any) {
        console.error('Error in generateSalarySlip controller:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_UNEXPECTED_ERROR,
            error: error.message,
        });
    }
};

const previewSalarySlip = async (req: Request, res: Response) => {
    try {
        const salarySlipRequest: ISalarySlipRequest = req.body;
        if (!salarySlipRequest.employeeId || !salarySlipRequest.employeeName || !salarySlipRequest.basicSalary || !salarySlipRequest.employeeEmail) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_MISSING_REQUIRED_FIELDS,
            });
        }

        const result = await generateSalarySlipByAdminService.generateSalarySlipPDF(salarySlipRequest);
        if (result.success && result.pdfBuffer) {
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SALARY_SLIP_SUCCESS_MESSAGES.SALARY_SLIP_GENERATED_SUCCESS,
                data: {
                    fileName: result.fileName,
                    pdfBase64: result.pdfBuffer.toString('base64'),
                    calculations: result.calculations,
                },
            });
        } else {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: result.error || SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_GENERATION_FAILED,
            });
        }
    } catch (error: any) {
        console.error('Error in previewSalarySlip controller:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_UNEXPECTED_ERROR,
            error: error.message,
        });
    }
};

export default { generateSalarySlip, previewSalarySlip };
