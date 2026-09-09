"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Log AWS configuration status for debugging
const awsRegion = process.env.AWS_REGION;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
if (!awsRegion || !awsAccessKeyId || !awsSecretAccessKey) {
    console.error('[S3Client] CRITICAL: Missing AWS configuration!');
    console.error('[S3Client] AWS_REGION:', awsRegion ? 'SET' : 'NOT SET');
    console.error('[S3Client] AWS_ACCESS_KEY_ID:', awsAccessKeyId ? 'SET (length: ' + awsAccessKeyId.length + ')' : 'NOT SET');
    console.error('[S3Client] AWS_SECRET_ACCESS_KEY:', awsSecretAccessKey ? 'SET (length: ' + awsSecretAccessKey.length + ')' : 'NOT SET');
}
else {
    console.warn('[S3Client] AWS configuration loaded successfully');
    console.warn('[S3Client] AWS_REGION:', awsRegion);
    console.warn('[S3Client] AWS_ACCESS_KEY_ID:', awsAccessKeyId ? 'SET (length: ' + awsAccessKeyId.length + ')' : 'NOT SET');
}
aws_sdk_1.default.config.update({
    region: awsRegion,
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
});
const s3 = new aws_sdk_1.default.S3();
console.warn('[S3Client] S3 client initialized successfully');
exports.default = s3;
