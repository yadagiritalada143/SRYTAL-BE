import s3Client from './s3Client';
import { bucketName } from '../config/awsS3Config';

const uploadImageToS3 = async (fileName: string, buffer: any, mimetype: string, s3FolderNameToUpload: string): Promise<any> => {
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
                reject(error);
            }
            resolve(data);
        });
    });
}

const getProfileImageFromS3 = async (fileName: string, s3FolderNameToUpload: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: bucketName,
            Key: `${s3FolderNameToUpload}/${fileName}`
        };

        s3Client.getObject(params, (error: any, data: any) => {
            if (error) {
                console.error(`Error fetching from S3: ${error}`);
                reject(error);
            }

            const responseFromS3 = {
                contentType: data.ContentType,
                body: data.Body
            }

            resolve({ success: true, imageDetails: responseFromS3 });
        });
    })
}

export default { uploadImageToS3, getProfileImageFromS3 }
