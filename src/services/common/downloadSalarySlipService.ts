import s3Client from '../../util/s3Client';
import { IDownloadSalarySlipRequest } from '../../interfaces/salarySlip';
import { bucketName, salarySlipsFolder } from '../../config/awsS3Config';

interface IDownloadSalarySlipResult {
    success: boolean;
    downloadUrl?: string;
    fileName?: string;
    error?: string;
}

const downloadSalarySlipService = async (params: IDownloadSalarySlipRequest): Promise<IDownloadSalarySlipResult> => {
    const { mongoId, fullName, month, year } = params;

    try {
        // Construct filename: Fullname-mon-year.pdf (e.g., John-Doe-Feb-2026.pdf)
        const sanitizedName = fullName.replace(/\s+/g, '-');
        const fileName = `${sanitizedName}-${month}-${year}.pdf`;
        const s3Key = `${salarySlipsFolder}/${mongoId}/${fileName}`;

        // Check if the file exists in S3
        await s3Client.headObject({
            Bucket: bucketName,
            Key: s3Key,
        }).promise();

        // Generate pre-signed URL valid for 5 minutes
        const downloadUrl = s3Client.getSignedUrl('getObject', {
            Bucket: bucketName,
            Key: s3Key,
            Expires: 60 * 5, // 5 minutes
        });

        return {
            success: true,
            downloadUrl,
            fileName,
        };
    } catch (error: any) {
        if (error.code === 'NotFound' || error.code === 'NoSuchKey') {
            console.error(`Salary slip not found: ${salarySlipsFolder}/${mongoId}/${fullName}-${month}-${year}.pdf`);
            return {
                success: false,
                error: 'SALARY_SLIP_NOT_FOUND',
            };
        }
        console.error(`S3 Error: ${error}`);
        throw new Error('Failed to fetch salary slip from S3');
    }
};

export default { downloadSalarySlipService };
