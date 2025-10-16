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
                console.error('Error uploading to S3 bucket:', error);
                reject(error);
            }
            console.log('Data is:', data);
            resolve(data);
        });
    });
}

export default { uploadThumbnailToS3 }
