"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const s3Client_1 = __importDefault(require("./s3Client"));
const awsS3Config_1 = require("../config/awsS3Config");
const uploadThumbnailToS3 = async (fileName, buffer, mimetype, s3FolderNameToUpload) => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: awsS3Config_1.bucketName,
            Key: `${s3FolderNameToUpload}/${fileName}`,
            Body: buffer,
            ContentType: mimetype,
        };
        s3Client_1.default.upload(params, (error, data) => {
            if (error) {
                console.error(`Error uploading to S3 bucket: ${error}`);
                return reject(error);
            }
            resolve(data);
        });
    });
};
const getCourseMediaFromS3 = async (s3Key) => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: awsS3Config_1.bucketName,
            Key: s3Key,
        };
        s3Client_1.default.getObject(params, (error, data) => {
            if (error) {
                console.error(`Error fetching course media from S3: ${error}`);
                return reject(error);
            }
            resolve({
                success: true,
                contentType: data.ContentType,
                body: data.Body,
            });
        });
    });
};
const getCourseMediaSignedUrl = async (s3Key, expiresIn = 3600) => {
    try {
        const params = {
            Bucket: awsS3Config_1.bucketName,
            Key: s3Key,
            Expires: expiresIn, // URL valid for 1 hour
        };
        const signedUrl = await s3Client_1.default.getSignedUrlPromise('getObject', params);
        return signedUrl;
    }
    catch (error) {
        console.error('Error generating S3 signed URL:', error);
        throw error;
    }
};
exports.default = { uploadThumbnailToS3, getCourseMediaFromS3, getCourseMediaSignedUrl };
