import { ISalarySlipRequest, ISalarySlipData, ISalaryCalculations } from '../../interfaces/salarySlip';
import { IPDFGenerationResult } from '../../interfaces/pdfGenerator';
import pdfGenerator from '../../util/pdfGenerator/generatePDF';
import salarySlipTemplate from '../../util/pdfGenerator/templates/salarySlipTemplate';
import { convertAmountToWords, formatIndianCurrency } from '../../util/pdfGenerator/numberToWords';

const COMPANY_BACKGROUND_IMAGE_BASE64 = 'data:image/jpeg;base64,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'; // Add your base64 image string here (without data:image prefix)

const COMPANY_DETAILS = {
    companyName: 'SRYTAL Systems India Private Limited',
    companyAddress: 'Hyderabad, Telangana - 500032. INDIA.',
    gstin: '36ABOCS4994F1ZO',
    cin: 'U62013TS2024PTC190245',
    email: 'admin@srytal.com',
    website: 'www.srytal.com',
    backgroundImage: COMPANY_BACKGROUND_IMAGE_BASE64,
};

const PDF_HEADER_TEMPLATE = `
<div style="width: 100%; font-size: 9px; padding: 10px 30px; box-sizing: border-box; border-bottom: 1px solid #ddd;">
    <div style="text-align: center; margin-bottom: 5px;">
        <strong style="font-size: 16px; font-weight: bold; color: #2e8bc9;">SRYTAL Systems India Private Limited</strong>
    </div>
    <div style="text-align: center; color: #555; margin-bottom: 5px;">
        Hyderabad, Telangana - 500032. INDIA.
    </div>
    <div style="display: flex; justify-content: space-between; color: #555;">
        <div>
            <span><strong>GSTIN:</strong> 36ABOCS4994F1ZO</span><br/>
            <span><strong>CIN:</strong> U62013TS2024PTC190245</span>
        </div>
        <div style="text-align: right;">
            <span>E-mail: admin@srytal.com</span><br/>
            <span>www.srytal.com</span>
        </div>
    </div>
</div>
`;

const getPdfFooterTemplate = (payDate: string): string => `
<div style="width: 100%; font-size: 10px; padding: 10px 30px; box-sizing: border-box; border-top: 1px solid #ddd; padding-top: 30px;  display: flex; justify-content: space-between; align-items: center;">
    <div style="color: #2c3e50; font-weight: 600;">
        Pay Date: ${payDate}
    </div>
    <div style="color: #c0392b; font-weight: bold; font-style: italic;">
        Strictly Private & Confidential
    </div>
</div>
`;

const SALARY_CALCULATION_DEFAULTS = {
    HRA_PERCENTAGE: 0,
    PF_PERCENTAGE: 0,
    PROFESSIONAL_TAX: 0,
    CONVEYANCE_ALLOWANCE: 0,
    MEDICAL_ALLOWANCE: 0,
};

const getPayslipMonth = (payPeriod: string): string => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const parts = payPeriod.trim().split(' ');
    if (parts.length !== 2) return payPeriod;

    const monthName = parts[0];
    const year = parseInt(parts[1], 10);

    const monthIndex = months.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
    if (monthIndex === -1 || isNaN(year)) return payPeriod;

    const nextMonthIndex = (monthIndex + 1) % 12;
    const nextYear = monthIndex === 11 ? year + 1 : year;
    return `${months[nextMonthIndex]} ${nextYear}`;
};

const getPayPeriodDateRange = (payPeriod: string): string => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthsShort = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const parts = payPeriod.trim().split(' ');
    if (parts.length !== 2) return payPeriod;

    const monthName = parts[0];
    const year = parseInt(parts[1], 10);

    const monthIndex = months.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
    if (monthIndex === -1 || isNaN(year)) return payPeriod;
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const formattedFirstDay = `01-${monthsShort[monthIndex]}-${year}`;
    const formattedLastDay = `${lastDay}-${monthsShort[monthIndex]}-${year}`;
    return `${formattedFirstDay} to ${formattedLastDay}`;
};

const calculateSalaryComponents = (request: ISalarySlipRequest): ISalaryCalculations => {
    const basicSalary = request.basicSalary;
    const hraPercentage = request.hraPercentage ?? SALARY_CALCULATION_DEFAULTS.HRA_PERCENTAGE;
    const hra = Math.round((basicSalary * hraPercentage) / 100);
    const conveyanceAllowance = request.conveyanceAllowance ?? SALARY_CALCULATION_DEFAULTS.CONVEYANCE_ALLOWANCE;
    const medicalAllowance = request.medicalAllowance ?? SALARY_CALCULATION_DEFAULTS.MEDICAL_ALLOWANCE;
    const specialAllowance = request.specialAllowance ?? 0;
    const otherAllowances = request.otherAllowances ?? 0;
    const grossEarnings = basicSalary + hra + specialAllowance + conveyanceAllowance + medicalAllowance + otherAllowances;
    const lopDays = request.lossOfPayDays ?? 0;
    const perDaySalary = grossEarnings / request.totalWorkingDays;
    const lopDeduction = Math.round(perDaySalary * lopDays);
    const adjustedGrossEarnings = grossEarnings - lopDeduction;
    const pfPercentage = request.pfPercentage ?? SALARY_CALCULATION_DEFAULTS.PF_PERCENTAGE;
    const providentFund = Math.round((basicSalary * pfPercentage) / 100);
    const professionalTax = request.professionalTax ?? SALARY_CALCULATION_DEFAULTS.PROFESSIONAL_TAX;
    const incomeTax = request.incomeTax ?? 0;
    const otherDeductions = request.otherDeductions ?? 0;
    const totalDeductions = providentFund + professionalTax + incomeTax + otherDeductions;
    const netPay = adjustedGrossEarnings - totalDeductions;
    const netPayInWords = convertAmountToWords(netPay);

    return {
        basicSalary: Number(formatIndianCurrency(basicSalary).replace(/,/g, '')),
        hra: Number(formatIndianCurrency(hra).replace(/,/g, '')),
        specialAllowance: Number(formatIndianCurrency(specialAllowance).replace(/,/g, '')),
        conveyanceAllowance: Number(formatIndianCurrency(conveyanceAllowance).replace(/,/g, '')),
        medicalAllowance: Number(formatIndianCurrency(medicalAllowance).replace(/,/g, '')),
        otherAllowances: Number(formatIndianCurrency(otherAllowances).replace(/,/g, '')),
        grossEarnings: Number(formatIndianCurrency(adjustedGrossEarnings).replace(/,/g, '')),
        providentFund: Number(formatIndianCurrency(providentFund).replace(/,/g, '')),
        professionalTax: Number(formatIndianCurrency(professionalTax).replace(/,/g, '')),
        incomeTax: Number(formatIndianCurrency(incomeTax).replace(/,/g, '')),
        otherDeductions: Number(formatIndianCurrency(otherDeductions).replace(/,/g, '')),
        totalDeductions: Number(formatIndianCurrency(totalDeductions).replace(/,/g, '')),
        netPay: Number(formatIndianCurrency(netPay).replace(/,/g, '')),
        netPayInWords,
    };
};

const prepareSalarySlipData = (request: ISalarySlipRequest): ISalarySlipData => {
    const calculations = calculateSalaryComponents(request);
    return {
        // Company Details
        companyName: COMPANY_DETAILS.companyName,
        companyAddress: COMPANY_DETAILS.companyAddress,
        backgroundImage: COMPANY_DETAILS.backgroundImage,

        // Employee Details
        employeeId: request.employeeId,
        employeeName: request.employeeName,
        designation: request.designation,
        department: request.department,
        dateOfJoining: request.dateOfJoining,
        payPeriod: request.payPeriod,
        payPeriodRange: getPayPeriodDateRange(request.payPeriod),
        payslipMonth: getPayslipMonth(request.payPeriod),
        payDate: request.payDate,
        bankName: request.bankName,
        IFSCCODE: request.IFSCCODE,
        bankAccountNumber: request.bankAccountNumber,
        transactionType: request.transactionType,
        transactionId: request.transactionId || '',
        panNumber: request.panNumber,
        uanNumber: request.uanNumber || 'N/A',
        totalWorkingDays: request.totalWorkingDays,
        daysWorked: request.daysWorked,
        lossOfPayDays: request.lossOfPayDays || 0,
        // Calculated Values
        calculations,
    };
};

const validateRequest = (request: ISalarySlipRequest): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!request.employeeId) errors.push('Employee ID is required');
    if (!request.employeeName) errors.push('Employee Name is required');
    if (!request.designation) errors.push('Designation is required');
    if (!request.department) errors.push('Department is required');
    if (!request.payPeriod) errors.push('Pay Period is required');
    if (!request.payDate) errors.push('Pay Date is required');
    if (!request.basicSalary || request.basicSalary <= 0) errors.push('Valid Basic Salary is required');
    if (!request.totalWorkingDays || request.totalWorkingDays <= 0) errors.push('Total Working Days is required');
    if (!request.daysWorked || request.daysWorked < 0) errors.push('Days Worked is required');

    return {
        isValid: errors.length === 0,
        errors,
    };
};

const generateSalarySlipPDF = async (request: ISalarySlipRequest): Promise<IPDFGenerationResult & { calculations?: ISalaryCalculations }> => {
    try {
        // Validate request
        const validation = validateRequest(request);
        if (!validation.isValid) {
            return {
                success: false,
                error: `Validation failed: ${validation.errors.join(', ')}`,
            };
        }
        const salarySlipData = prepareSalarySlipData(request);
        const htmlContent = pdfGenerator.injectDataIntoTemplate(
            salarySlipTemplate,
            salarySlipData as unknown as Record<string, any>
        );
        const pdfResult = await pdfGenerator.generatePDFWithHeaderFooter(
            htmlContent,
            PDF_HEADER_TEMPLATE,
            getPdfFooterTemplate(request.payDate),
            {
                format: 'A4',
                margin: {
                    top: '60px',
                    right: '20px',
                    bottom: '100px',
                    left: '20px',
                },
                printBackground: true,
            }
        );
        if (pdfResult.success) {
            const fileName = `${request.payPeriod.replace(/\s+/g, '-')}-${request.employeeName.replace(/\s+/g, '-')}_Salary-Slip.pdf`;
            return {
                ...pdfResult,
                fileName,
                calculations: salarySlipData.calculations,
            };
        }
        return pdfResult;
    } catch (error: any) {
        console.error('Error generating salary slip:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate salary slip',
        };
    }
};

export default { generateSalarySlipPDF, calculateSalaryComponents, prepareSalarySlipData, validateRequest };
