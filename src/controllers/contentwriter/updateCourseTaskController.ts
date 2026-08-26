import { Request, Response } from 'express';
import updateCourseTaskService from '../../services/contentwriter/updateCourseTaskService';
import { COURSE_TASK_ERRORS_MESSAGES } from '../../constants/contentwriter/coursetaskMessages';
import isValidStatus from '../../util/validateCourseStatusTypesUtil';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import uploadThumbnailToS3 from '../../util/manageCourseMedia';
import { courseTaskContentFolder, courseTaskThumbnailsFolder } from '../../config/awsS3Config';

const updateCourseTask = async (req: Request, res: Response) => {
    try {
        
        const { id, taskName, taskDescription, status } = req.body;

        if (!isValidStatus(status)) {
            return res.status(400).json({
                success: false,
                message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_STATUS_MESSAGE,
            });
        }

        const files = req.files as {[fieldname: string]: Express.Multer.File[]};

        const taskFile = files?.taskFile?.[0];
        const thumbnailFile = files?.thumbnailFile?.[0];

        let newContent: string | undefined;
        let newContentMimeType: string | undefined;
        let newContentFileName: string | undefined;

        let newThumbnail: string | undefined;

        if (taskFile) {
            const {
                originalname,
                buffer,
                mimetype,
            } = taskFile;

            const uniqueName =
                uuidv4() + path.extname(originalname);

            await uploadThumbnailToS3.uploadThumbnailToS3(
                uniqueName,
                buffer,
                mimetype,
                courseTaskContentFolder,
            );

            newContent =
                `${courseTaskContentFolder}/${uniqueName}`;

            newContentMimeType = mimetype;
            newContentFileName = originalname;
        }

        if (thumbnailFile) {
            const allowedThumbnailTypes = [
                'image/jpeg',
                'image/png',
                'image/webp',
            ];

            if (
                !allowedThumbnailTypes.includes(
                    thumbnailFile.mimetype,
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_THUMBNAIL_TYPE_MESSAGE,
                });
            }

            const { originalname, buffer, mimetype } = thumbnailFile;

            const uniqueName =
                uuidv4() + path.extname(originalname);

            await uploadThumbnailToS3.uploadThumbnailToS3(
                uniqueName,
                buffer,
                mimetype,
                courseTaskThumbnailsFolder,
            );

            newThumbnail =
                `${courseTaskThumbnailsFolder}/${uniqueName}`;
        }


        const updateCourseResponse = await updateCourseTaskService.updateCourseTask(
            id,
            taskName,
            taskDescription,
            newThumbnail,
            status.toUpperCase(),
            newContent,
            newContentMimeType,
            newContentFileName,
        );
        res.status(200).json(updateCourseResponse);
    } catch (error: any) {
        console.error(`Error in updating course task: ${error}`);
        res.status(500).json({
            success: false,
            message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_UPDATE_ERROR_MESSAGE,
        });
    }
}

export default { updateCourseTask };
