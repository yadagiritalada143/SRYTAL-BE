import { Request, Response } from 'express';
import updateCourseService from '../../services/contentwriter/updateCourseService'
import { COURSE_ERROR_MESSAGES, COURSE_SUCCESS_MESSAGES } from '../../constants/contentwriter/courseMessages';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import uploadThumbnailToS3 from '../../util/manageCourseMedia';
import { coursesThumbnailsFolder } from '../../config/awsS3Config';

const updateCourse = async (req: Request, res: Response) => {
    try {
        const { id, courseName, courseDescription, status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: COURSE_ERROR_MESSAGES.COURSE_INVALID_STATUS_MESSAGE,
            });
        }

        let thumbnailKey: string | undefined = undefined;

        if (req.file) {
            const { originalname, buffer, mimetype } = req.file;
            const uniqueName = uuidv4() + path.extname(originalname);
            const uploadResponse: any = await uploadThumbnailToS3.uploadThumbnailToS3(
                uniqueName,
                buffer,
                mimetype,
                coursesThumbnailsFolder,
            ).catch((error: any) => {
                console.error(`Error uploading thumbnail to S3: ${error}`);
                return res.status(500).json({
                    success: false,
                    message: COURSE_ERROR_MESSAGES.COURSE_UPDATE_ERROR_MESSAGE,
                });
            });

            if (res.headersSent) return;
            thumbnailKey = uploadResponse.key;
        }

        const updateCourseResponse = await updateCourseService.updateCourse(
            id,
            courseName,
            courseDescription,
            thumbnailKey,
            status.toUpperCase(),
        );

        if (!updateCourseResponse.success) {
            if (updateCourseResponse.responseAfterUpdateCourse === 'COURSE_DUPLICATE_NAME') {
                return res.status(400).json({
                    success: false,
                    message: COURSE_ERROR_MESSAGES.COURSE_DUPLICATE_NAME_MESSAGE,
                });
            }
            if (updateCourseResponse.responseAfterUpdateCourse === 'Course not found') {
                return res.status(404).json({
                    success: false,
                    message: COURSE_ERROR_MESSAGES.COURSE_UPDATE_ERROR_MESSAGE,
                });
            }
            return res.status(500).json({
                success: false,
                message: COURSE_ERROR_MESSAGES.COURSE_UPDATE_ERROR_MESSAGE
            });
        }

        return res.status(200).json({
            success: true,
            message: COURSE_SUCCESS_MESSAGES.COURSE_UPDATE_SUCCESS_MESSAGE,
            data: updateCourseResponse.responseAfterUpdateCourse
        });
    } catch (error: any) {
        console.error(`Error in updating course: ${error}`);
        res.status(500).json({
            success: false,
            message: COURSE_ERROR_MESSAGES.COURSE_UPDATE_ERROR_MESSAGE,
        });
    }
};

export default { updateCourse };
