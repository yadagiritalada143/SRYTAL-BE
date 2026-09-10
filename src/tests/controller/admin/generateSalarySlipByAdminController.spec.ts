import { Request, Response } from 'express';
import generateSalarySlipByAdminService from '../../../services/admin/generateSalarySlipByAdminService';
import sendSalarySlipNotificationEmail from '../../../util/sendSalarySlipNotificationEmail';
import manageSalarySlips from '../../../util/manageSalarySlips';
import {
    SALARY_SLIP_SUCCESS_MESSAGES,
    SALARY_SLIP_ERROR_MESSAGES,
    HTTP_STATUS,
} from '../../../constants/admin/salarySlipMessages';

let generateSalarySlipByAdminController: any;

jest.mock('../../../services/admin/generateSalarySlipByAdminService', () => ({
    __esModule: true,
    default: {
        generateSalarySlipPDF: jest.fn(),
    },
}));

jest.mock('../../../util/sendSalarySlipNotificationEmail', () => ({
    __esModule: true,
    default: {
        sendSalarySlipNotificationEmail: jest.fn(async () => undefined),
    },
}));

jest.mock('../../../util/manageSalarySlips', () => ({
    __esModule: true,
    default: {
        uploadSalarySlipToS3: jest.fn(async () => ({ success: true })),
    },
}));

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('generateSalarySlipByAdminController', () => {
    let req: Partial<Request>;
    let res: Partial<Response> & {
        status: jest.Mock;
        json: jest.Mock;
        setHeader: jest.Mock;
        send: jest.Mock;
    };

    beforeAll(() => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
        generateSalarySlipByAdminController = require('../../../controllers/admin/generateSalarySlipByAdminController').default;
    });

    const requestBody = {
        _id: 'slip1',
        employeeId: 'EMP-1',
        employeeName: 'John Doe',
        employeeEmail: 'john@x.com',
        payPeriod: 'July 2026',
        payDate: '2026-07-25',
        basicSalary: 50000,
    };

    beforeEach(() => {
        req = { body: requestBody };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            setHeader: jest.fn(),
            send: jest.fn(),
        };
        jest.clearAllMocks();
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
        (sendSalarySlipNotificationEmail.sendSalarySlipNotificationEmail as jest.Mock).mockResolvedValue(undefined);
        (manageSalarySlips.uploadSalarySlipToS3 as jest.Mock).mockResolvedValue({ success: true });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('generateSalarySlip', () => {
        it('sends the pdf and kicks off async email and S3 upload', async () => {
            const pdfBuffer = Buffer.from('PDF');
            (generateSalarySlipByAdminService.generateSalarySlipPDF as jest.Mock).mockResolvedValue({
                success: true,
                fileName: 'slip.pdf',
                pdfBuffer,
            });

            const returned = await generateSalarySlipByAdminController.generateSalarySlip(req as Request, res as Response);
            await flushMicrotasks();

            expect(generateSalarySlipByAdminService.generateSalarySlipPDF).toHaveBeenCalledWith(requestBody);
            expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
            expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="slip.pdf"');
            expect(res.setHeader).toHaveBeenCalledWith('Content-Length', 3);
            expect(res.send).toHaveBeenCalledWith(pdfBuffer);
            expect(res.status).not.toHaveBeenCalled();
            expect(returned).toBeUndefined();

            expect(sendSalarySlipNotificationEmail.sendSalarySlipNotificationEmail).toHaveBeenCalledWith({
                employeeName: 'John Doe',
                employeeEmail: 'john@x.com',
                payPeriod: 'July 2026',
                payDate: '2026-07-25',
            });
            expect(manageSalarySlips.uploadSalarySlipToS3).toHaveBeenCalledWith({
                mongoId: 'slip1',
                employeeName: 'John Doe',
                payPeriod: 'July 2026',
                pdfBuffer,
            });
        });

        it('logs when the async email and S3 upload fail', async () => {
            const pdfBuffer = Buffer.from('PDF');
            (generateSalarySlipByAdminService.generateSalarySlipPDF as jest.Mock).mockResolvedValue({
                success: true,
                fileName: 'slip.pdf',
                pdfBuffer,
            });
            (sendSalarySlipNotificationEmail.sendSalarySlipNotificationEmail as jest.Mock).mockRejectedValue(
                new Error('smtp down')
            );
            (manageSalarySlips.uploadSalarySlipToS3 as jest.Mock).mockRejectedValue(new Error('s3 down'));

            await generateSalarySlipByAdminController.generateSalarySlip(req as Request, res as Response);
            await flushMicrotasks();

            expect(res.send).toHaveBeenCalledWith(pdfBuffer);
            expect(console.error).toHaveBeenCalled();
        });

        it('returns 400 with missing-fields message when required fields are absent', async () => {
            req = { body: { employeeId: 'EMP-1', basicSalary: 50000 } };

            const returned = await generateSalarySlipByAdminController.generateSalarySlip(req as Request, res as Response);

            expect(generateSalarySlipByAdminService.generateSalarySlipPDF).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_MISSING_REQUIRED_FIELDS,
            });
            expect(returned).toBeUndefined();
        });

        it('returns 400 with the service error when generation fails', async () => {
            (generateSalarySlipByAdminService.generateSalarySlipPDF as jest.Mock).mockResolvedValue({
                success: false,
                error: 'Bad template',
            });

            await generateSalarySlipByAdminController.generateSalarySlip(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Bad template',
            });
        });

        it('falls back to the generic failure message when no service error is provided', async () => {
            (generateSalarySlipByAdminService.generateSalarySlipPDF as jest.Mock).mockResolvedValue({
                success: false,
            });

            await generateSalarySlipByAdminController.generateSalarySlip(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_GENERATION_FAILED,
            });
        });

        it('returns 500 with the unexpected-error message when the service throws', async () => {
            (generateSalarySlipByAdminService.generateSalarySlipPDF as jest.Mock).mockRejectedValue(
                new Error('boom')
            );

            await generateSalarySlipByAdminController.generateSalarySlip(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_UNEXPECTED_ERROR,
                error: 'boom',
            });
        });
    });

    describe('previewSalarySlip', () => {
        it('returns 200 with pdf base64 and calculations on success', async () => {
            const pdfBuffer = Buffer.from('PDF');
            const calculations = { netPay: 50000 };
            (generateSalarySlipByAdminService.generateSalarySlipPDF as jest.Mock).mockResolvedValue({
                success: true,
                fileName: 'slip.pdf',
                pdfBuffer,
                calculations,
            });

            await generateSalarySlipByAdminController.previewSalarySlip(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: SALARY_SLIP_SUCCESS_MESSAGES.SALARY_SLIP_GENERATED_SUCCESS,
                data: {
                    fileName: 'slip.pdf',
                    pdfBase64: 'UERG',
                    calculations,
                },
            });
        });

        it('returns 400 with missing-fields message when required fields are absent', async () => {
            req = { body: { employeeName: 'John Doe' } };

            await generateSalarySlipByAdminController.previewSalarySlip(req as Request, res as Response);

            expect(generateSalarySlipByAdminService.generateSalarySlipPDF).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_MISSING_REQUIRED_FIELDS,
            });
        });

        it('returns 400 when pdf generation fails', async () => {
            (generateSalarySlipByAdminService.generateSalarySlipPDF as jest.Mock).mockResolvedValue({
                success: false,
                error: 'Bad template',
            });

            await generateSalarySlipByAdminController.previewSalarySlip(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Bad template',
            });
        });

        it('returns 400 with the generic failure message when no service error is present', async () => {
            (generateSalarySlipByAdminService.generateSalarySlipPDF as jest.Mock).mockResolvedValue({
                success: false,
            });

            await generateSalarySlipByAdminController.previewSalarySlip(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_GENERATION_FAILED,
            });
        });

        it('returns 500 when the service throws', async () => {
            (generateSalarySlipByAdminService.generateSalarySlipPDF as jest.Mock).mockRejectedValue(
                new Error('boom')
            );

            await generateSalarySlipByAdminController.previewSalarySlip(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_UNEXPECTED_ERROR,
                error: 'boom',
            });
        });
    });
});