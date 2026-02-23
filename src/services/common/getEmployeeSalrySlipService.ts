import s3Client  from '../../util/s3Client';
import { ISalarySlipResult } from '../../interfaces/salarySlip';
import {  bucketName, salarySlipsFolder } from '../../config/awsS3Config';

const getEmployeeSalarySlipService = async ( mongoId: string ): Promise<ISalarySlipResult[] | any> => {
    try {

        if (!mongoId) {
            throw new Error('Employee ID is required');
        }
        const prefix = `${salarySlipsFolder}/${mongoId}/`;

        const data = await s3Client.listObjectsV2({
            Bucket: bucketName,
            Prefix: prefix,
        }).promise();

        if (!data.Contents || data.Contents.length === 0) {
            return [];
        }

    const salarySlips: ISalarySlipResult[] = data.Contents.map(item => ({
        mongoId,
        key: item.Key!,
        fileName: item.Key!.split('/').pop() || '',
        downloadUrl: s3Client.getSignedUrl('getObject', { Bucket: bucketName, Key: item.Key!, Expires: 60*5 })}));
        return salarySlips;

    } catch (error: any) {
        console.error(`S3 Fetch Error: ${error}`);
        throw new Error('Failed to fetch salary slips from S3');
    }
};

export default { getEmployeeSalarySlipService };
