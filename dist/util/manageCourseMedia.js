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
                console.error('Error uploading to S3 bucket:', error);
                reject(error);
            }
            console.log('Data is:', data);
            resolve(data);
        });
    });
};
exports.default = { uploadThumbnailToS3 };
