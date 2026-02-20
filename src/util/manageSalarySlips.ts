import s3Client from './s3Client';
import { bucketName, salarySlipsFolder } from '../config/awsS3Config';
import { IUploadSalarySlipParams } from '../interfaces/salarySlip';

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

    try {
        const fileName = generateSalarySlipFileName(employeeName, payPeriod);
        const s3Key = `${salarySlipsFolder}/${mongoId}/${fileName}`;

        const uploadParams = {
            Bucket: bucketName,
            Key: s3Key,
            Body: pdfBuffer,
            ContentType: 'application/pdf',
        };

        return new Promise((resolve, reject) => {
            s3Client.upload(uploadParams, (error: any, data: any) => {
                if (error) {
                    console.error(`Error uploading salary slip to S3: ${error}`);
                    reject({ success: false, error: error.message });
                }
                console.log(`Salary slip uploaded successfully to S3: ${s3Key}`);
                resolve({ success: true, location: data?.Location });
            });
        });
    } catch (error: any) {
        console.error('Error in uploadSalarySlipToS3:', error);
        return { success: false, error: error.message };
    }
};

export default { uploadSalarySlipToS3, generateSalarySlipFileName };
