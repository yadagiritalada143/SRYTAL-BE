import { Request, Response } from 'express';
import updateCourseModuleService from '../../services/contentwriter/updateCourseModuleService';
import { COURSE_MODULE_ERRORS_MESSAGES } from '../../constants/contentwriter/coursemoduleMessages';
import isValidStatus from '../../util/validateCourseStatusTypesUtil';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import uploadThumbnailToS3 from '../../util/manageCourseMedia';
import { courseModuleThumbnailsFolder } from '../../config/awsS3Config';

const updateCourseModule = async (req: Request, res: Response) => {
    try {
        const { id, moduleName, moduleDescription, status } = req.body;

        if (!isValidStatus(status)) {
            return res.status(400).json({
                success: false,
                message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_INVALID_STATUS_MESSAGE,
            });
        }

        let thumbnailKey: string | undefined = undefined;
        if(req.file) {
            const { originalname, buffer, mimetype } = req.file;
            const uniqueName = uuidv4() + path.extname(originalname);
            const uploadResponse: any = await uploadThumbnailToS3.uploadThumbnailToS3(
                uniqueName,
                buffer,
                mimetype,
                courseModuleThumbnailsFolder,
            ).catch((error: any) => {
                console.error(`Error uploading thumbnail to S3: ${error}`);
                return res.status(500).json({
                    success: false,
                    message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_UPDATE_ERROR_MESSAGE,
                });
            });

            if (res.headersSent) return;
            thumbnailKey = uploadResponse.key;
        }
        const updateCourseModuleResponse = await updateCourseModuleService.updateCourseModule(
            id,
            moduleName,
            moduleDescription,
            thumbnailKey,
            status.toUpperCase(),
        );
        res.status(200).json(updateCourseModuleResponse);
    } catch (error: any) {
        console.error(`Error in updating module: ${error}`);
        res.status(500).json({
            success: false,
            message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_UPDATE_ERROR_MESSAGE,
        });
    }
};

export default { updateCourseModule };
