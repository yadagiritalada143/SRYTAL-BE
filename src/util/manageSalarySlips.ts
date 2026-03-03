import s3Client from './s3Client';
import { bucketName, salarySlipsFolder } from '../config/awsS3Config';
import { IUploadSalarySlipParams } from '../interfaces/salarySlip';

console.warn('[ManageSalarySlips] Module loaded');
console.warn('[ManageSalarySlips] Bucket Name:', bucketName);
console.warn('[ManageSalarySlips] Salary Slips Folder:', salarySlipsFolder);

const generateSalarySlipFileName = (employeeName: string, payPeriod: string): string => {
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

const uploadSalarySlipToS3 = async (params: IUploadSalarySlipParams): Promise<{ success: boolean; location?: string; error?: string }> => {
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
        const s3Key = `${salarySlipsFolder}/${mongoId}/${fileName}`;

        console.warn('[ManageSalarySlips] Generated file name:', fileName);
        console.warn('[ManageSalarySlips] S3 Key:', s3Key);
        console.warn('[ManageSalarySlips] Target Bucket:', bucketName);

        const uploadParams = {
            Bucket: bucketName,
            Key: s3Key,
            Body: pdfBuffer,
            ContentType: 'application/pdf',
        };

        console.warn('[ManageSalarySlips] Starting S3 upload...');

        return new Promise((resolve, reject) => {
            s3Client.upload(uploadParams, (error: any, data: any) => {
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
                console.warn('[ManageSalarySlips] File Location:', data?.Location);
                console.warn('[ManageSalarySlips] S3 Key:', s3Key);
                resolve({ success: true, location: data?.Location });
            });
        });
    } catch (error: any) {
        console.error('[ManageSalarySlips] EXCEPTION in uploadSalarySlipToS3');
        console.error('[ManageSalarySlips] Error Name:', error.name);
        console.error('[ManageSalarySlips] Error Message:', error.message);
        console.error('[ManageSalarySlips] Error Stack:', error.stack);
        return { success: false, error: error.message };
    }
};

export default { uploadSalarySlipToS3, generateSalarySlipFileName };
