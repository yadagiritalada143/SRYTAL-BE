import s3Client from './s3Client';
import { bucketName } from '../config/awsS3Config';

const uploadThumbnailToS3 = async (fileName: string, buffer: any, mimetype: string, s3FolderNameToUpload: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: bucketName,
            Key: `${s3FolderNameToUpload}/${fileName}`,
            Body: buffer,
            ContentType: mimetype,
        };

        s3Client.upload(params, (error: any, data: any) => {
            if (error) {
                console.error(`Error uploading to S3 bucket: ${error}`);
                return reject(error);
            }
            resolve(data);
        });
    });
}

const getCourseMediaFromS3 = async (s3Key: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: bucketName,
            Key: s3Key,
        };

        s3Client.getObject(params, (error: any, data: any) => {
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
}

const getCourseMediaSignedUrl = async (s3Key: string, expiresIn: number = 3600): Promise<string> => {
    try {
        const params = {
            Bucket: bucketName,
            Key: s3Key,
            Expires: expiresIn, // URL valid for 1 hour
        };

        const signedUrl = await s3Client.getSignedUrlPromise(
            'getObject',
            params
        );

        return signedUrl;
    } catch (error) {
        console.error('Error generating S3 signed URL:', error);
        throw error;
    }
};

export default { uploadThumbnailToS3, getCourseMediaFromS3, getCourseMediaSignedUrl }
