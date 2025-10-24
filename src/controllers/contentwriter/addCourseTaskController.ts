import { Request, Response } from 'express';
import addNewCourseTaskService from '../../services/contentwriter/addCourseTaskService';
import { COURSE_TASK_SUCCESS_MESSAGES, COURSE_TASK_ERRORS_MESSAGES } from '../../constants/contentwriter/coursetaskMessages';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import uploadThumbnailToS3 from '../../util/manageCourseMedia';
import { courseTaskThumbnailFolder } from '../../config/awsS3Config';

const addTaskToModule = async (req: Request, res: Response) => {
    try {
        const { moduleId, taskName, taskDescription } = req.body;
        const type = 'TEXT';
        let uniqueThumbnailKey: string = '';

        // Code to upload the thumbnail to AWS S3 //
        if (req.file) {
            const { originalname, buffer, mimetype } = req.file;
            const uniqueName = uuidv4() + path.extname(originalname);
            uniqueThumbnailKey = await uploadThumbnailToS3.uploadThumbnailToS3(uniqueName, buffer, mimetype, courseTaskThumbnailFolder)
                .then((responseAfterProfileImageUpload: any) => {
                    return responseAfterProfileImageUpload.key;
                })
                .catch((error: any) => {
                    console.log(`Error occured while Thumbnail Image upload: ${error}`);
                    res.status(500).json({ success: false, message: 'Error updating the thumbnail' });
                })
        }

        const responseAfteraddingCourseTask = await addNewCourseTaskService.addCourseTaskService(moduleId, taskName, taskDescription, type, uniqueThumbnailKey, 'ACTIVE')

        if (responseAfteraddingCourseTask.id) {
            return res.status(201).json({ message: COURSE_TASK_SUCCESS_MESSAGES.COURSE_TASK_ADD_SUCCESS_MESSAGE });
        } else {
            return res.status(500).json({ message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_ADD_ERROR_MESSAGE });
        }

    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_ADD_ERROR_MESSAGE });
    }

}

export default { addTaskToModule };
