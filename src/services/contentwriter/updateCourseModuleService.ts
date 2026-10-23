import CourseModuleModel from '../../model/coursemoduleModel';
import { IUpdateCourseModuleResponse } from '../../interfaces/coursemodule';
import s3Client from '../../util/s3Client';
import { bucketName } from '../../config/awsS3Config';
import { stripHtmlTags } from '../../util/stripHtmlTags';


const updateCourseModule = async (id: string, moduleName: string, moduleDescription: string, thumbnail?: string, status?: string, orderIdx?: number): Promise<IUpdateCourseModuleResponse> => {
    try {

        const existingCourseModule = await CourseModuleModel.findById(id);

        if (!existingCourseModule) {
            return { success: false, responseAfterModuleUpdate: 'Course module not found' };
        }

         const existingModuleWithOrderIdx = await CourseModuleModel.findOne({
            courseId: existingCourseModule.courseId,
            orderIdx,
            _id: { $ne: id }
        });

        if (existingModuleWithOrderIdx) {
            return {
                success: false,
                message: 'DUPLICATE_ORDER_IDX'
            };
        }

        const courseModuleWithSameName = await CourseModuleModel.findOne({ moduleName, _id: { $ne: id } });
        if (courseModuleWithSameName) {
            return { success: false, responseAfterModuleUpdate: 'COURSE_MODULE_DUPLICATE_NAME' };
        }

        const updateFields: any = { moduleName, moduleDescription: stripHtmlTags(moduleDescription), status, orderIdx };

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
