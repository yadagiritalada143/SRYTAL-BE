"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const s3Client_1 = __importDefault(require("../../util/s3Client"));
const awsS3Config_1 = require("../../config/awsS3Config");
const downloadSalarySlipService = async (params) => {
    const { mongoId, fullName, month, year } = params;
    try {
        // Construct filename: Fullname-mon-year.pdf (e.g., John-Doe-Feb-2026.pdf)
        const sanitizedName = fullName.replace(/\s+/g, '-');
        const fileName = `${sanitizedName}-${month}-${year}.pdf`;
        const s3Key = `${awsS3Config_1.salarySlipsFolder}/${mongoId}/${fileName}`;
        // Check if the file exists in S3
        await s3Client_1.default.headObject({
            Bucket: awsS3Config_1.bucketName,
            Key: s3Key,
        }).promise();
        // Generate pre-signed URL valid for 5 minutes
        const downloadUrl = s3Client_1.default.getSignedUrl('getObject', {
            Bucket: awsS3Config_1.bucketName,
            Key: s3Key,
            Expires: 60 * 5, // 5 minutes
        });
        return {
            success: true,
            downloadUrl,
            fileName,
        };
    }
    catch (error) {
        if (error.code === 'NotFound' || error.code === 'NoSuchKey') {
            console.error(`Salary slip not found: ${awsS3Config_1.salarySlipsFolder}/${mongoId}/${fullName}-${month}-${year}.pdf`);
            return {
                success: false,
                error: 'SALARY_SLIP_NOT_FOUND',
            };
        }
        console.error(`S3 Error: ${error}`);
        throw new Error('Failed to fetch salary slip from S3');
    }
};
exports.default = { downloadSalarySlipService };
