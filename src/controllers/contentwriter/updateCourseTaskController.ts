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
        
        const { id, taskName, taskDescription, status, isCoding, question, allowedLanguages, starterCode } = req.body;

        if (!isValidStatus(status)) {
            return res.status(400).json({
                success: false,
                message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_STATUS_MESSAGE,
            });
        }

        // Coding tasks are flagged via isCoding (string from multipart form or boolean).
        let isCodingTask: boolean | undefined;
        if (isCoding !== undefined) {
            isCodingTask = isCoding === true || isCoding === 'true' || isCoding === 1 || isCoding === '1';
        }

        let allowedLanguagesList: string[] | undefined;
        if (allowedLanguages !== undefined) {
            if (Array.isArray(allowedLanguages)) {
                allowedLanguagesList = allowedLanguages;
            } else if (typeof allowedLanguages === 'string') {
                try {
                    const parsed = JSON.parse(allowedLanguages);
                    allowedLanguagesList = Array.isArray(parsed) ? parsed : [parsed];
                } catch {
                    allowedLanguagesList = allowedLanguages.split(',').map((item: string) => item.trim()).filter(Boolean);
                }
            }
        }

        let starterCodeMap: Record<string, string> | undefined;
        if (starterCode !== undefined) {
            if (typeof starterCode === 'string') {
                try {
                    starterCodeMap = JSON.parse(starterCode);
                } catch {
                    starterCodeMap = {};
                }
            } else {
                starterCodeMap = starterCode;
            }
        }

        if (isCodingTask === true) {
            if (!question) {
                return res.status(400).json({ success: false, message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_MISSING_QUESTION_MESSAGE });
            }
            if (!allowedLanguagesList || !allowedLanguagesList.length) {
                return res.status(400).json({ success: false, message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_MISSING_LANGUAGES_MESSAGE });
            }
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
            isCodingTask,
            question,
            allowedLanguagesList,
            starterCodeMap,
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
