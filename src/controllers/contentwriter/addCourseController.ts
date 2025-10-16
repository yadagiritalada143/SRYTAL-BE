import { Request, Response } from 'express';
import addNewCourseService from '../../services/contentwriter/addCourseService';
import { COURSE_SUCCESS_MESSAGES, COURSE_ERROR_MESSAGES } from '../../constants/contentwriter/courseMessages';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import uploadThumbnailToS3 from '../../util/manageCourseMedia';
import { coursesThumbnailsFolder } from '../../config/awsS3Config';

const addNewCourse = async (req: Request, res: Response) => {
    try {
        const { courseName, courseDescription } = req.body;
        let uniqueThumbnailKey: string = '';

        // Code to upload the thumbnail to AWS S3 //
        if (req.file) {
            const { originalname, buffer, mimetype } = req.file;
            const uniqueName = uuidv4() + path.extname(originalname);
            uniqueThumbnailKey = await uploadThumbnailToS3.uploadThumbnailToS3(uniqueName, buffer, mimetype, coursesThumbnailsFolder)
                .then((responseAfterProfileImageUpload: any) => {
                    return responseAfterProfileImageUpload.key;
                })
                .catch((error: any) => {
                    console.log(`Error occured while Thumbnail Image upload: ${error}`);
                    res.status(500).json({ success: false, message: 'Error updating the thumbnail' });
                })
        }

        const responseAfteraddingCourse = await addNewCourseService.addCourseService(courseName, courseDescription, uniqueThumbnailKey, 'ACTIVE')

        if (responseAfteraddingCourse) {
            return res.status(201).json({ message: COURSE_SUCCESS_MESSAGES.COURSE_ADD_SUCCESS_MESSAGE });
        } else {
            res.status(500).json({ success: false, message: COURSE_ERROR_MESSAGES.COURSE_ADD_ERROR_MESSAGE });
        }
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ success: false, message: COURSE_ERROR_MESSAGES.COURSE_ADD_ERROR_MESSAGE });
    }
}

export default { addNewCourse };
