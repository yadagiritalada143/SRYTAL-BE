export interface ISalarySlipRequest {
    _id: string;
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
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
    basicSalary: number;
    hraPercentage?: number;
    specialAllowance?: number;
    conveyanceAllowance?: number;
    medicalAllowance?: number;
    otherAllowances?: number;
    pfPercentage?: number;
    professionalTax?: number;
    incomeTax?: number;
    otherDeductions?: number;
}

export interface ISalaryCalculations {
    basicSalary: number;
    hra: number;
    specialAllowance: number;
    conveyanceAllowance: number;
    medicalAllowance: number;
    otherAllowances: number;
    grossEarnings: number;
    lossOfPayAmount: number;
    providentFund: number;
    professionalTax: number;
    incomeTax: number;
    otherDeductions: number;
    totalDeductions: number;
    netPay: number;
    netPayInWords: string;
}

export interface ISalarySlipData {
    companyName: string;
    companyAddress: string;
    companyLogo?: string;
    backgroundImage?: string;
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
    calculations: ISalaryCalculations;
}

export interface ISalarySlipEmailDetails {
    employeeName: string;
    employeeEmail: string;
    payPeriod: string;
    payDate: string;
}

export interface IUploadSalarySlipParams {
    mongoId: string;
    employeeName: string;
    payPeriod: string;
    pdfBuffer: Buffer;
}
