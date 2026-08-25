import CourseModuleModel from '../../model/coursemoduleModel';
import { IUpdateCourseModuleResponse } from '../../interfaces/coursemodule';
import s3Client from '../../util/s3Client';
import { bucketName } from '../../config/awsS3Config';


const updateCourseModule = async (id: string, moduleName: string, moduleDescription: string, thumbnail?: string, status?: string): Promise<IUpdateCourseModuleResponse> => {
    try {

        const existingCourseModule = await CourseModuleModel.findById(id);

        if (!existingCourseModule) {
            return { success: false, responseAfterModuleUpdate: 'Course module not found' };
        }

        const updateFields: any = { moduleName, moduleDescription, status };

        if (thumbnail) {
            updateFields.thumbnail = thumbnail;
            if (existingCourseModule.thumbnail) {
                await s3Client.deleteObject({ Bucket: bucketName, Key: existingCourseModule.thumbnail })
                .promise()
                .catch((error: any) => console.error(`Error deleting old thumbnail from S3: ${error}`));
            }
        }

        const result = await CourseModuleModel.updateOne({ _id: id }, updateFields);
        if (!result) {
            return { success: false };
        }

        return { success: true, responseAfterModuleUpdate: result };
    } catch (error: any) {
        console.error(`Error in updating module: ${error}`);
        return { success: false, responseAfterModuleUpdate: error };
    }
}

export default { updateCourseModule };
