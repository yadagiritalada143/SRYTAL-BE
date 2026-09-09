"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const s3Client_1 = __importDefault(require("./s3Client"));
const awsS3Config_1 = require("../config/awsS3Config");
console.warn('[ManageSalarySlips] Module loaded');
console.warn('[ManageSalarySlips] Bucket Name:', awsS3Config_1.bucketName);
console.warn('[ManageSalarySlips] Salary Slips Folder:', awsS3Config_1.salarySlipsFolder);
const generateSalarySlipFileName = (employeeName, payPeriod) => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthsShort = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const sanitizedName = employeeName.replace(/\s+/g, '-');
    const parts = payPeriod.trim().split(' ');
    if (parts.length !== 2) {
        return `${sanitizedName}-${payPeriod.replace(/\s+/g, '-')}.pdf`;
    }
    const monthName = parts[0];
    const year = parseInt(parts[1], 10);
    const monthIndex = months.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
    if (monthIndex === -1 || isNaN(year)) {
        return `${sanitizedName}-${payPeriod.replace(/\s+/g, '-')}.pdf`;
    }
    const nextMonthIndex = (monthIndex + 1) % 12;
    const nextYear = monthIndex === 11 ? year + 1 : year;
    return `${sanitizedName}-${monthsShort[nextMonthIndex]}-${nextYear}.pdf`;
};
const uploadSalarySlipToS3 = async (params) => {
    const { mongoId, employeeName, payPeriod, pdfBuffer } = params;
    console.warn('[ManageSalarySlips] uploadSalarySlipToS3 called');
    console.warn('[ManageSalarySlips] Employee ID (mongoId):', mongoId);
    console.warn('[ManageSalarySlips] Employee Name:', employeeName);
    console.warn('[ManageSalarySlips] Pay Period:', payPeriod);
    console.warn('[ManageSalarySlips] PDF Buffer size:', pdfBuffer ? pdfBuffer.length + ' bytes' : 'NO BUFFER');
    if (!pdfBuffer || pdfBuffer.length === 0) {
        console.error('[ManageSalarySlips] ERROR: PDF buffer is empty or undefined!');
        return { success: false, error: 'PDF buffer is empty or undefined' };
    }
    try {
        const fileName = generateSalarySlipFileName(employeeName, payPeriod);
        const s3Key = `${awsS3Config_1.salarySlipsFolder}/${mongoId}/${fileName}`;
        console.warn('[ManageSalarySlips] Generated file name:', fileName);
        console.warn('[ManageSalarySlips] S3 Key:', s3Key);
        console.warn('[ManageSalarySlips] Target Bucket:', awsS3Config_1.bucketName);
        const uploadParams = {
            Bucket: awsS3Config_1.bucketName,
            Key: s3Key,
            Body: pdfBuffer,
            ContentType: 'application/pdf',
        };
        console.warn('[ManageSalarySlips] Starting S3 upload...');
        return new Promise((resolve, reject) => {
            s3Client_1.default.upload(uploadParams, (error, data) => {
                if (error) {
                    console.error('[ManageSalarySlips] S3 Upload FAILED!');
                    console.error('[ManageSalarySlips] Error Code:', error.code);
                    console.error('[ManageSalarySlips] Error Message:', error.message);
                    console.error('[ManageSalarySlips] Error Stack:', error.stack);
                    console.error('[ManageSalarySlips] Full Error Object:', JSON.stringify(error, null, 2));
                    reject({ success: false, error: error.message });
                    return;
                }
                console.warn('[ManageSalarySlips] S3 Upload SUCCESS!');
                console.warn('[ManageSalarySlips] File Location:', data === null || data === void 0 ? void 0 : data.Location);
                console.warn('[ManageSalarySlips] S3 Key:', s3Key);
                resolve({ success: true, location: data === null || data === void 0 ? void 0 : data.Location });
            });
        });
    }
    catch (error) {
        console.error('[ManageSalarySlips] EXCEPTION in uploadSalarySlipToS3');
        console.error('[ManageSalarySlips] Error Name:', error.name);
        console.error('[ManageSalarySlips] Error Message:', error.message);
        console.error('[ManageSalarySlips] Error Stack:', error.stack);
        return { success: false, error: error.message };
    }
};
exports.default = { uploadSalarySlipToS3, generateSalarySlipFileName };
