"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const s3Client_1 = __importDefault(require("./s3Client"));
const awsS3Config_1 = require("../config/awsS3Config");
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
    try {
        const fileName = generateSalarySlipFileName(employeeName, payPeriod);
        const s3Key = `${awsS3Config_1.salarySlipsFolder}/${mongoId}/${fileName}`;
        const uploadParams = {
            Bucket: awsS3Config_1.bucketName,
            Key: s3Key,
            Body: pdfBuffer,
            ContentType: 'application/pdf',
        };
        return new Promise((resolve, reject) => {
            s3Client_1.default.upload(uploadParams, (error, data) => {
                if (error) {
                    console.error(`Error uploading salary slip to S3: ${error}`);
                    reject({ success: false, error: error.message });
                }
                console.log(`Salary slip uploaded successfully to S3: ${s3Key}`);
                resolve({ success: true, location: data === null || data === void 0 ? void 0 : data.Location });
            });
        });
    }
    catch (error) {
        console.error('Error in uploadSalarySlipToS3:', error);
        return { success: false, error: error.message };
    }
};
exports.default = { uploadSalarySlipToS3, generateSalarySlipFileName };
