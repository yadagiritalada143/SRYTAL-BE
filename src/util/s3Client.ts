import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Log AWS configuration status for debugging
const awsRegion = process.env.AWS_REGION;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!awsRegion || !awsAccessKeyId || !awsSecretAccessKey) {
    console.error('[S3Client] CRITICAL: Missing AWS configuration!');
    console.error('[S3Client] AWS_REGION:', awsRegion ? 'SET' : 'NOT SET');
    console.error('[S3Client] AWS_ACCESS_KEY_ID:', awsAccessKeyId ? 'SET (length: ' + awsAccessKeyId.length + ')' : 'NOT SET');
    console.error('[S3Client] AWS_SECRET_ACCESS_KEY:', awsSecretAccessKey ? 'SET (length: ' + awsSecretAccessKey.length + ')' : 'NOT SET');
} else {
    console.warn('[S3Client] AWS configuration loaded successfully');
    console.warn('[S3Client] AWS_REGION:', awsRegion);
    console.warn('[S3Client] AWS_ACCESS_KEY_ID:', awsAccessKeyId ? 'SET (length: ' + awsAccessKeyId.length + ')' : 'NOT SET');
}

AWS.config.update({
    region: awsRegion,
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
});

const s3 = new AWS.S3();
console.warn('[S3Client] S3 client initialized successfully');

export default s3;
