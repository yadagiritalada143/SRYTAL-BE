import { Request, Response } from 'express';
import addCourseModuleService from '../../services/contentwriter/addCourseModuleService';
import { COURSE_MODULE_SUCCESS_MESSAGES, COURSE_MODULE_ERRORS_MESSAGES } from '../../constants/contentwriter/coursemoduleMessages';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import uploadThumbnailToS3 from '../../util/manageCourseMedia';
import { courseModuleThumbnailsFolder } from '../../config/awsS3Config';

const addModuleToCourse = async (req: Request, res: Response) => {
    try {
        const { courseId, moduleName, moduleDescription } = req.body;
        let uniqueThumbnailKey: string = '';

        // Code to upload the thumbnail to AWS S3 //
        if (req.file) {
            const { originalname, buffer, mimetype } = req.file;
            const uniqueName = uuidv4() + path.extname(originalname);
            uniqueThumbnailKey = await uploadThumbnailToS3.uploadThumbnailToS3(uniqueName, buffer, mimetype, courseModuleThumbnailsFolder)
                .then((responseAfterProfileImageUpload: any) => {
                    return responseAfterProfileImageUpload.key;
                })
                .catch((error: any) => {
                    console.error(`Error occured while Thumbnail Image upload: ${error}`);
                    res.status(500).json({ success: false, message: 'Error updating the thumbnail' });
                })
        }

        const responseAfteraddingCourseModule = await addCourseModuleService.addNewCourseModuleService(courseId, moduleName, moduleDescription, uniqueThumbnailKey, 'ACTIVE');

        if (responseAfteraddingCourseModule) {
            return res.status(201).json({ message: COURSE_MODULE_SUCCESS_MESSAGES.COURSE_MODULE_ADD_SUCCESS_MESSAGE })

        } else {
          return res.status(500).json({ message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_ADD_ERROR_MESSAGE });
        }

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_ADD_ERROR_MESSAGE });
    }
}

export default { addModuleToCourse };
