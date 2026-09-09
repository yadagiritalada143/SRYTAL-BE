import CourseModel from '../../model/coursesModel';
import s3Client from '../../util/s3Client';
import { bucketName } from '../../config/awsS3Config';

interface updateCourseResponse {
    success: boolean;
    responseAfterUpdateCourse?: any;
}

const updateCourse = async (id: string, courseName: string, courseDescription: string, thumbnail?: string, status?: string ):Promise<updateCourseResponse> => {
    try{
        const existingCourse = await CourseModel.findById(id);
        if (!existingCourse) {
            return { success: false, responseAfterUpdateCourse: 'Course not found' };
        }

        const updateFields: any = { courseName, courseDescription, status };
        if (thumbnail) {
            updateFields.thumbnail = thumbnail;

            if (existingCourse.thumbnail) {
                await s3Client.deleteObject({ Bucket: bucketName, Key: existingCourse.thumbnail })
                    .promise()
                    .catch((error: any) => console.error(`Error deleting old thumbnail from S3: ${error}`));
            }
        }

        const result = await CourseModel.updateOne({_id: id}, updateFields)
        if (!result) {
             return { success: false };
        }

         return { success: true, responseAfterUpdateCourse: result };
    } catch(error:any){
        console.error(`Error in updating Course: ${error}`);
         return { success: false, responseAfterUpdateCourse: error };
    }
}

export default { updateCourse };
