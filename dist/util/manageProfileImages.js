"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const s3Client_1 = __importDefault(require("./s3Client"));
const awsS3Config_1 = require("../config/awsS3Config");
const uploadImageToS3 = async (fileName, buffer, mimetype, s3FolderNameToUpload) => {
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
                reject(error);
            }
            resolve(data);
        });
    });
};
const getProfileImageFromS3 = async (fileName, s3FolderNameToUpload) => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: awsS3Config_1.bucketName,
            Key: `${s3FolderNameToUpload}/${fileName}`
        };
        s3Client_1.default.getObject(params, (error, data) => {
            if (error) {
                console.error(`Error fetching from S3: ${error}`);
                reject(error);
            }
            const responseFromS3 = {
                contentType: data.ContentType,
                body: data.Body
            };
            resolve({ success: true, imageDetails: responseFromS3 });
        });
    });
};
exports.default = { uploadImageToS3, getProfileImageFromS3 };
