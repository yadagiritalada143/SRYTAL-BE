import pdfGenerator from '../../../util/pdfGenerator/generatePDF';
import salarySlipTemplate from '../../../util/pdfGenerator/templates/salarySlipTemplate';
import { convertAmountToWords, formatIndianCurrency } from '../../../util/pdfGenerator/numberToWords';
import { ISalarySlipRequest } from '../../../interfaces/salarySlip';

let generateSalarySlipByAdminService: any;

jest.mock('../../../util/pdfGenerator/generatePDF', () => ({
    __esModule: true,
    default: {
        injectDataIntoTemplate: jest.fn((template: string, data: Record<string, any>) => `<html>${template}</html>`),
        generatePDFWithHeaderFooter: jest.fn(async () => ({ success: true, pdfBuffer: Buffer.from('PDF-DATA') })),
    },
}));

jest.mock('../../../util/pdfGenerator/templates/salarySlipTemplate', () => ({
    __esModule: true,
    default: '<div>slip-template</div>',
}));

jest.mock('../../../util/pdfGenerator/numberToWords', () => ({
    convertAmountToWords: jest.fn((n: number) => `${n} rupees`),
    formatIndianCurrency: jest.fn((n: number) => String(n)),
}));

const pdfGeneratorMock = pdfGenerator as unknown as {
    injectDataIntoTemplate: jest.Mock;
    generatePDFWithHeaderFooter: jest.Mock;
};
const convertAmountToWordsMock = convertAmountToWords as jest.Mock;
const formatIndianCurrencyMock = formatIndianCurrency as jest.Mock;

const buildRequest = (overrides: Partial<ISalarySlipRequest> = {}): ISalarySlipRequest => ({
    _id: 'slip1',
    employeeId: 'EMP-1',
    employeeName: 'John Doe',
    employeeEmail: 'john@x.com',
    designation: 'Developer',
    department: 'IT',
    dateOfJoining: '2024-01-01',
    payPeriod: 'July 2026',
    payDate: '2026-07-25',
    bankName: 'HDFC',
    IFSCCODE: 'HDFC0001',
    bankAccountNumber: '123456',
    transactionType: 'NEFT',
    transactionId: 'TXN1',
    panNumber: 'PAN123',
    uanNumber: 'UAN123',
    totalWorkingDays: 26,
    daysWorked: 24,
    lossOfPayDays: 2,
    basicSalary: 50000,
    hraPercentage: 10,
    specialAllowance: 3000,
    conveyanceAllowance: 2000,
    medicalAllowance: 1500,
    otherAllowances: 1000,
    pfPercentage: 12,
    professionalTax: 200,
    incomeTax: 500,
    otherDeductions: 100,
    ...overrides,
});

describe('generateSalarySlipByAdminService', () => {
    beforeAll(() => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        generateSalarySlipByAdminService = require('../../../services/admin/generateSalarySlipByAdminService').default;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
        convertAmountToWordsMock.mockImplementation((n: number) => `${n} rupees`);
        formatIndianCurrencyMock.mockImplementation((n: number) => String(n));
        pdfGeneratorMock.generatePDFWithHeaderFooter.mockResolvedValue({
            success: true,
            pdfBuffer: Buffer.from('PDF-DATA'),
        });
        pdfGeneratorMock.injectDataIntoTemplate.mockImplementation(
            (template: string, data: Record<string, any>) => `<html>${template}</html>`
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('validateRequest', () => {
        it('is valid for a complete request', () => {
            const validation = generateSalarySlipByAdminService.validateRequest(buildRequest());
            expect(validation.isValid).toBe(true);
            expect(validation.errors).toEqual([]);
        });

        it('flags every missing required field', () => {
            const validation = generateSalarySlipByAdminService.validateRequest({} as ISalarySlipRequest);
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Employee ID is required');
            expect(validation.errors).toContain('Employee Name is required');
            expect(validation.errors).toContain('Employee Email is required');
            expect(validation.errors).toContain('Designation is required');
            expect(validation.errors).toContain('Department is required');
            expect(validation.errors).toContain('Pay Period is required');
            expect(validation.errors).toContain('Valid Basic Salary is required');
            expect(validation.errors).toContain('Total Working Days is required');
            expect(validation.errors).toContain('Days Worked is required');
        });

        it('rejects an invalid pay date', () => {
            const validation = generateSalarySlipByAdminService.validateRequest(
                buildRequest({ payDate: '2026-02-30' })
            );
            expect(validation.isValid).toBe(false);
            expect(validation.errors.join(', ')).toContain('Pay date 2026-02-30 is invalid');
        });

        it('rejects a completely unparseable pay date', () => {
            const validation = generateSalarySlipByAdminService.validateRequest(
                buildRequest({ payDate: 'not-a-date' })
            );
            expect(validation.isValid).toBe(false);
        });

        it('rejects non-positive basic salary, total working days and negative days worked', () => {
            const validation = generateSalarySlipByAdminService.validateRequest(
                buildRequest({ basicSalary: 0, totalWorkingDays: 0, daysWorked: -1 })
            );
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Valid Basic Salary is required');
            expect(validation.errors).toContain('Total Working Days is required');
            expect(validation.errors).toContain('Days Worked is required');
        });
    });

    describe('calculateSalaryComponents', () => {
        it('applies the default allowances when none are provided', () => {
            const calculations = generateSalarySlipByAdminService.calculateSalaryComponents({
                basicSalary: 10000,
                totalWorkingDays: 20,
            } as ISalarySlipRequest);

            expect(calculations).toEqual({
                basicSalary: 10000,
                hra: 0,
                specialAllowance: 0,
                conveyanceAllowance: 0,
                medicalAllowance: 0,
                otherAllowances: 0,
                grossEarnings: 10000,
                lossOfPayAmount: 0,
                providentFund: 0,
                professionalTax: 0,
                incomeTax: 0,
                otherDeductions: 0,
                totalDeductions: 0,
                netPay: 10000,
                netPayInWords: '10000 rupees',
            });
            expect(convertAmountToWordsMock).toHaveBeenCalledWith(10000);
            expect(formatIndianCurrencyMock).toHaveBeenCalled();
        });
    });

    describe('generateSalarySlipPDF', () => {
        it('generates a successful pdf and returns file name plus calculations', async () => {
            const request = buildRequest();

            const result = await generateSalarySlipByAdminService.generateSalarySlipPDF(request);

            expect(pdfGeneratorMock.injectDataIntoTemplate).toHaveBeenCalledTimes(1);
            const data = pdfGeneratorMock.injectDataIntoTemplate.mock.calls[0][1];
            expect(data.payPeriodRange).toBe('01-Jul-2026 to 31-Jul-2026');
            expect(data.payslipMonth).toBe('August 2026');
            expect(data.payDate).toBe('25-Jul-2026');

            expect(pdfGeneratorMock.generatePDFWithHeaderFooter).toHaveBeenCalledTimes(1);
            expect(pdfGeneratorMock.generatePDFWithHeaderFooter.mock.calls[0][0]).toContain('slip-template');
            expect(pdfGeneratorMock.generatePDFWithHeaderFooter.mock.calls[0][2]).toContain(
                'Pay Date: 25-Jul-2026'
            );

            expect(result.success).toBe(true);
            expect(result.pdfBuffer).toEqual(Buffer.from('PDF-DATA'));
            expect(result.fileName).toBe('July-2026-John-Doe_Salary-Slip.pdf');
            expect(result.calculations).toEqual({
                basicSalary: 50000,
                hra: 5000,
                specialAllowance: 3000,
                conveyanceAllowance: 2000,
                medicalAllowance: 1500,
                otherAllowances: 1000,
                grossEarnings: 62500,
                lossOfPayAmount: 4808,
                providentFund: 6000,
                professionalTax: 200,
                incomeTax: 500,
                otherDeductions: 100,
                totalDeductions: 11608,
                netPay: 50892,
                netPayInWords: '50892 rupees',
            });
        });

        it('handles a December pay period and rolls the payslip month into the next year', async () => {
            const request = buildRequest({ payPeriod: 'December 2025' });

            const result = await generateSalarySlipByAdminService.generateSalarySlipPDF(request);

            const data = pdfGeneratorMock.injectDataIntoTemplate.mock.calls[0][1];
            expect(data.payslipMonth).toBe('January 2026');
            expect(data.payPeriodRange).toBe('01-Dec-2025 to 31-Dec-2025');
            expect(result.success).toBe(true);
        });

        it('passes through ambiguous pay periods unchanged', async () => {
            const request = buildRequest({ payPeriod: 'Garbage' });

            const result = await generateSalarySlipByAdminService.generateSalarySlipPDF(request);

            const data = pdfGeneratorMock.injectDataIntoTemplate.mock.calls[0][1];
            expect(data.payslipMonth).toBe('Garbage');
            expect(data.payPeriodRange).toBe('Garbage');
            expect(result.fileName).toBe('Garbage-John-Doe_Salary-Slip.pdf');
            expect(result.success).toBe(true);
        });

        it('passes through a month with an invalid year unchanged', async () => {
            const request = buildRequest({ payPeriod: 'March XXXX' });

            await generateSalarySlipByAdminService.generateSalarySlipPDF(request);

            const data = pdfGeneratorMock.injectDataIntoTemplate.mock.calls[0][1];
            expect(data.payslipMonth).toBe('March XXXX');
            expect(data.payPeriodRange).toBe('March XXXX');
        });

        it('passes through an unknown month name unchanged', async () => {
            const request = buildRequest({ payPeriod: 'Foo 2026' });

            await generateSalarySlipByAdminService.generateSalarySlipPDF(request);

            const data = pdfGeneratorMock.injectDataIntoTemplate.mock.calls[0][1];
            expect(data.payslipMonth).toBe('Foo 2026');
            expect(data.payPeriodRange).toBe('Foo 2026');
        });

        it('returns a validation failure without calling the pdf generator', async () => {
            const request = buildRequest({ employeeId: '' });

            const result = await generateSalarySlipByAdminService.generateSalarySlipPDF(request);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Validation failed:');
            expect(pdfGeneratorMock.generatePDFWithHeaderFooter).not.toHaveBeenCalled();
        });

        it('returns the pdf generator result when pdf generation is not successful', async () => {
            pdfGeneratorMock.generatePDFWithHeaderFooter.mockResolvedValue({ success: false });

            const result = await generateSalarySlipByAdminService.generateSalarySlipPDF(buildRequest());

            expect(result).toEqual({ success: false });
        });

        it('returns an error result when an exception is thrown', async () => {
            const error = new Error('template boom');
            pdfGeneratorMock.injectDataIntoTemplate.mockImplementation(() => {
                throw error;
            });

            const result = await generateSalarySlipByAdminService.generateSalarySlipPDF(buildRequest());

            expect(result.success).toBe(false);
            expect(result.error).toBe('template boom');
        });

        it('returns an unknown error message when the error has no message', async () => {
            pdfGeneratorMock.injectDataIntoTemplate.mockImplementation(() => {
                throw 'plain-string-error';
            });

            const result = await generateSalarySlipByAdminService.generateSalarySlipPDF(buildRequest());

            expect(result.success).toBe(false);
        });
    });

    describe('prepareSalarySlipData', () => {
        it('defaults optional display values', () => {
            const data = generateSalarySlipByAdminService.prepareSalarySlipData(
                buildRequest({ transactionId: undefined, uanNumber: undefined, lossOfPayDays: undefined })
            );
            expect(data.transactionId).toBe('');
            expect(data.uanNumber).toBe('N/A');
            expect(data.lossOfPayDays).toBe(0);
        });
    });
});