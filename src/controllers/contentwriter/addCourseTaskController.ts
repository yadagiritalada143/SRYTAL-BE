import { Request, Response } from 'express';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import addNewCourseTaskService from '../../services/contentwriter/addCourseTaskService';
import uploadThumbnailToS3 from '../../util/manageCourseMedia';
import { courseTaskContentFolder, courseTaskThumbnailsFolder } from '../../config/awsS3Config';
import { COURSE_TASK_SUCCESS_MESSAGES, COURSE_TASK_ERRORS_MESSAGES } from '../../constants/contentwriter/coursetaskMessages';


/**
 * Upload file to S3 and return the stored object key.
 *
 * Existing S3 functionality is kept unchanged.
 */
const uploadToS3 = async ( file: Express.Multer.File, folder: string): Promise<string> => {
    const uniqueName = uuidv4() + path.extname(file.originalname);

    await uploadThumbnailToS3.uploadThumbnailToS3(
        uniqueName,
        file.buffer,
        file.mimetype,
        folder
    );

    return `${folder}/${uniqueName}`;
};

const addTaskToModule = async (req: Request, res: Response) => {
    try {
        const { moduleId, taskName, taskDescription, link, type } = req.body;

        const status = 'ACTIVE';

        const taskType = String(type || '').toUpperCase();

        if (!taskType ) {
            return res.status(400).json({
                success: false,
                message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_TYPE_MESSAGE
            });
        }

        /**
         * ---------------------------------------------------------
         * Uploaded files
         * ---------------------------------------------------------
         *
         * taskFile      -> only required for FILE
         * thumbnailFile -> optional for every task type
         */
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        const taskFile = files?.taskFile?.[0];
        const thumbnailFile = files?.thumbnailFile?.[0];

        /**
         * ---------------------------------------------------------
         * Task content
         * ---------------------------------------------------------
         */
        let content = '';
        let contentMimeType = '';
        let contentFileName = '';

        /**
         * ---------------------------------------------------------
         * LINK
         * ---------------------------------------------------------
         *
         * Store the supplied link as content.
         */
        if (taskType === 'LINK') {
            content = String(link || '').trim();

            if (!content) {
                return res.status(400).json({
                    success: false,
                    message:
                        COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_MISSING_CONTENT_MESSAGE
                });
            }
        }

        /**
         * ---------------------------------------------------------
         * FILE
         * ---------------------------------------------------------
         *
         * Existing S3 upload functionality.
         */
        if (taskType === 'FILE') {
            if (!taskFile) {
                return res.status(400).json({
                    success: false,
                    message:
                        COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_MISSING_CONTENT_MESSAGE
                });
            }

            content = await uploadToS3(
                taskFile,
                courseTaskContentFolder
            );

            contentMimeType = taskFile.mimetype;
            contentFileName = taskFile.originalname;
        }

        /**
         * ---------------------------------------------------------
         * Thumbnail
         * ---------------------------------------------------------
         *
         * Existing S3 thumbnail upload remains unchanged.
         */
        let thumbnailPath = '';

        if (thumbnailFile) {
            thumbnailPath = await uploadToS3(
                thumbnailFile,
                courseTaskThumbnailsFolder
            );
        }

        /**
         * ---------------------------------------------------------
         * Add course task
         * ---------------------------------------------------------
         */
        const responseAfteraddingCourseTask =
            await addNewCourseTaskService.addCourseTask(
                moduleId,
                taskName,
                taskDescription,
                thumbnailPath,
                status,
                taskType,
                content,
                contentMimeType,
                contentFileName,
            );

        /**
         * ---------------------------------------------------------
         * Response
         * ---------------------------------------------------------
         */
        if (responseAfteraddingCourseTask ) {
            
            return res.status(201).json({
                message: COURSE_TASK_SUCCESS_MESSAGES.COURSE_TASK_ADD_SUCCESS_MESSAGE,
                data: responseAfteraddingCourseTask
            });
        } else {
            return res.status(400).json({ message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_ADD_ERROR_MESSAGE });
        }

        
    } catch (error: any) {
        console.error( `Error in adding Task to Module: ${error}`);
        return res.status(500).json({ success: false, message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_ADD_ERROR_MESSAGE });
    }
};

export default { addTaskToModule };
