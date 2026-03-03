import { Request, Response } from 'express';
import generateSalarySlipByAdminService from '../../services/admin/generateSalarySlipByAdminService';
import { SALARY_SLIP_SUCCESS_MESSAGES, SALARY_SLIP_ERROR_MESSAGES, HTTP_STATUS } from '../../constants/admin/salarySlipMessages';
import { ISalarySlipRequest } from '../../interfaces/salarySlip';
import sendSalarySlipNotificationEmail from '../../util/sendSalarySlipNotificationEmail';
import manageSalarySlips from '../../util/manageSalarySlips';

console.warn('[SalarySlipController] Module loaded');

const generateSalarySlip = async (req: Request, res: Response) => {
    console.warn('[SalarySlipController] generateSalarySlip endpoint called');
    try {
        const salarySlipRequest: ISalarySlipRequest = req.body;
        console.warn('[SalarySlipController] Request Body:', JSON.stringify({
            _id: salarySlipRequest._id,
            employeeId: salarySlipRequest.employeeId,
            employeeName: salarySlipRequest.employeeName,
            employeeEmail: salarySlipRequest.employeeEmail,
            payPeriod: salarySlipRequest.payPeriod,
            payDate: salarySlipRequest.payDate,
            basicSalary: salarySlipRequest.basicSalary
        }));

        if (!salarySlipRequest.employeeId || !salarySlipRequest.employeeName || !salarySlipRequest.basicSalary || !salarySlipRequest.employeeEmail) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_MISSING_REQUIRED_FIELDS,
            });
        }
        console.warn('[SalarySlipController] Calling generateSalarySlipPDF service...');
        const result = await generateSalarySlipByAdminService.generateSalarySlipPDF(salarySlipRequest);
        console.warn('[SalarySlipController] PDF Generation Result:', JSON.stringify({
            success: result.success,
            fileName: result.fileName,
            pdfBufferSize: result.pdfBuffer ? result.pdfBuffer.length : 0,
            error: result.error
        }));

        if (result.success && result.pdfBuffer) {
            console.warn('[SalarySlipController] PDF generated successfully, sending response...');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
            res.setHeader('Content-Length', result.pdfBuffer.length);
            res.send(result.pdfBuffer);

            // Send salary slip notification email asynchronously (fire and forget)
            console.warn('[SalarySlipController] Initiating email notification (async)...');
            sendSalarySlipNotificationEmail.sendSalarySlipNotificationEmail({
                employeeName: salarySlipRequest.employeeName,
                employeeEmail: salarySlipRequest.employeeEmail,
                payPeriod: salarySlipRequest.payPeriod,
                payDate: salarySlipRequest.payDate,
            }).then(() => {
                console.warn('[SalarySlipController] Email notification completed successfully');
            }).catch((error) => {
                console.error('[SalarySlipController] Email notification FAILED!');
                console.error('[SalarySlipController] Email Error:', error.message);
                console.error('[SalarySlipController] Email Error Stack:', error.stack);
            });

            console.warn('[SalarySlipController] Initiating S3 upload (async)...');
            manageSalarySlips.uploadSalarySlipToS3({
                mongoId: salarySlipRequest._id,
                employeeName: salarySlipRequest.employeeName,
                payPeriod: salarySlipRequest.payPeriod,
                pdfBuffer: result.pdfBuffer,
            }).then((uploadResult) => {
                console.warn('[SalarySlipController] S3 upload completed:', JSON.stringify(uploadResult));
            }).catch((error) => {
                console.error('[SalarySlipController] S3 upload FAILED!');
                console.error('[SalarySlipController] S3 Error:', error.message || error.error);
                console.error('[SalarySlipController] S3 Error Details:', JSON.stringify(error));
            });

            console.warn('[SalarySlipController] Response sent, async tasks initiated');
            return;
        } else {
            console.error('[SalarySlipController] PDF generation failed!');
            console.error('[SalarySlipController] Error:', result.error);
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: result.error || SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_GENERATION_FAILED,
            });
        }
    } catch (error: any) {
        console.error('[SalarySlipController] EXCEPTION in generateSalarySlip controller!');
        console.error('[SalarySlipController] Error Name:', error.name);
        console.error('[SalarySlipController] Error Message:', error.message);
        console.error('[SalarySlipController] Error Stack:', error.stack);
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
