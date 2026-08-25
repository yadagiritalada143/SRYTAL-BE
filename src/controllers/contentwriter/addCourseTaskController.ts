import { Request, Response } from 'express';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import addNewCourseTaskService from '../../services/contentwriter/addCourseTaskService';
import uploadThumbnailToS3 from '../../util/manageCourseMedia';
import { courseTaskContentFolder, courseTaskThumbnailsFolder } from '../../config/awsS3Config';
import { COURSE_TASK_SUCCESS_MESSAGES, COURSE_TASK_ERRORS_MESSAGES } from '../../constants/contentwriter/coursetaskMessages';

const addTaskToModule = async (req: Request, res: Response) => {
    try {
        const { moduleId, taskName, taskDescription, link } = req.body;
        const status = 'ACTIVE';
        //get uploaded files 
        //  taskFile       -> PDF, Word, Video, etc.
        //  thumbnailFile  -> JPG, PNG, WEBP, etc.
        const files = req.files as {[fieldname: string]: Express.Multer.File[]};

        const taskFile = files?.taskFile?.[0];
        const thumbnailFile = files?.thumbnailFile?.[0];

        // A task's content is flexible: either an uploaded file (pdf/word/any)
        // or an external link (YouTube, blog, etc).
        let type = 'LINK';
        let content = link || '';
        let contentMimeType = '';
        let contentFileName = '';

        // Thumbnail path

        let thumbnailPath = '';

        // When a file is uploaded, push it to S3 and store the object key.
        if (taskFile) {
            const { originalname, buffer, mimetype } = taskFile;
            const uniqueName = uuidv4() + path.extname(originalname);
            const s3Key = `${courseTaskContentFolder}/${uniqueName}`;

            await uploadThumbnailToS3.uploadThumbnailToS3(uniqueName, buffer, mimetype, courseTaskContentFolder);

            type = 'FILE';
            content = s3Key;
            contentMimeType = mimetype;
            contentFileName = originalname;
        }

        if (thumbnailFile) {
            const { originalname, buffer, mimetype } = thumbnailFile;

            const uniqueName = uuidv4() + path.extname(originalname);

            thumbnailPath = `${courseTaskThumbnailsFolder}/${uniqueName}`;

            await uploadThumbnailToS3.uploadThumbnailToS3(uniqueName, buffer, mimetype, courseTaskThumbnailsFolder);
        }


        if (!content) {
            return res
            .status(400).json({ success: false, message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_MISSING_CONTENT_MESSAGE });
        }

        const responseAfteraddingCourseTask: any = await addNewCourseTaskService.addCourseTask(
            moduleId,
            taskName,
            taskDescription,
            thumbnailPath,
            status,
            type,
            content,
            contentMimeType,
            contentFileName,
        );

        if (responseAfteraddingCourseTask && responseAfteraddingCourseTask.id) {
            return res.status(201).json({
                message: COURSE_TASK_SUCCESS_MESSAGES.COURSE_TASK_ADD_SUCCESS_MESSAGE,
                taskId: responseAfteraddingCourseTask.id,
                taskName: responseAfteraddingCourseTask.taskName,
                taskDescription: responseAfteraddingCourseTask.taskDescription,
                type: responseAfteraddingCourseTask.type,
            });
        }

        return res
            .status(400)
            .json({ message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_ADD_ERROR_MESSAGE });
    } catch (error: any) {
        console.error(`Error in adding Task to Module: ${error}`);
        return res
            .status(500)
            .json({ success: false, message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_ADD_ERROR_MESSAGE });
    }
};

export default { addTaskToModule };
