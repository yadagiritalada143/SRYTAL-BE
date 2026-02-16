export interface ISalarySlipRequest {
    employeeId: string;
    employeeName: string;
    designation: string;
    department: string;
    dateOfJoining: string;
    payPeriod: string;
    payDate: string;
    bankName: string;
    IFSCCODE: string;
    bankAccountNumber: string;
    transactionType: string;
    transactionId?: string;
    panNumber: string;
    uanNumber?: string;
    totalWorkingDays: number;
    daysWorked: number;
    lossOfPayDays?: number;

    // Earnings
    basicSalary: number;
    hraPercentage?: number;
    specialAllowance?: number;
    conveyanceAllowance?: number;
    medicalAllowance?: number;
    otherAllowances?: number;

    // Deductions
    pfPercentage?: number;
    professionalTax?: number;
    incomeTax?: number;
    otherDeductions?: number;
    additionalAllowances?: IAdditionalAllowance[];
}

export interface ISalaryCalculations {
    // Earnings
    basicSalary: number;
    hra: number;
    specialAllowance: number;
    conveyanceAllowance: number;
    medicalAllowance: number;
    otherAllowances: number;
    grossEarnings: number;
    additionalAllowancesTotal: number;
    additionalAllowancesDetails?: IAdditionalAllowance[];

    // Deductions
    providentFund: number;
    professionalTax: number;
    incomeTax: number;
    otherDeductions: number;
    totalDeductions: number;

    // Net Pay
    netPay: number;
    netPayInWords: string;
}

export interface ISalarySlipData {
    // Company Details
    companyName: string;
    companyAddress: string;
    companyLogo?: string;
    backgroundImage?: string;

    // Employee Details
    employeeId: string;
    employeeName: string;
    designation: string;
    department: string;
    dateOfJoining: string;
    payPeriod: string;
    payPeriodRange: string;
    payslipMonth: string;
    payDate: string;
    bankName: string;
    IFSCCODE: string;
    bankAccountNumber: string;
    transactionType: string;
    transactionId?: string;
    panNumber: string;
    uanNumber: string;
    totalWorkingDays: number;
    daysWorked: number;
    lossOfPayDays: number;

    // Calculated Values
    calculations: ISalaryCalculations;
}

export interface IAdditionalAllowance {
    name: string;
    amount: number;
}
