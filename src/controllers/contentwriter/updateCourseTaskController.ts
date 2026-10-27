import { Request, Response } from 'express';
import updateCourseTaskService from '../../services/contentwriter/updateCourseTaskService';
import { COURSE_TASK_ERRORS_MESSAGES } from '../../constants/contentwriter/coursetaskMessages';
import isValidCourseTaskStatus from '../../util/validateCourseTaskStatusTypesUtil';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import uploadThumbnailToS3 from '../../util/manageCourseMedia';
import { courseTaskContentFolder, courseTaskThumbnailsFolder } from '../../config/awsS3Config';
import { isAllowedCourseTaskFile } from '../../util/validateCourseTaskFile';

// Uploads one multer file to the given S3 folder under a unique name and
// returns the object key.
const uploadToS3 = async (
    file: Express.Multer.File,
    folder: string
): Promise<string> => {
    const uniqueName = uuidv4() + path.extname(file.originalname);

    await uploadThumbnailToS3.uploadThumbnailToS3(uniqueName, file.buffer, file.mimetype, folder);

    return `${folder}/${uniqueName}`;
};

const updateCourseTask = async (req: Request, res: Response) => {
    try {
        const { id, taskName, taskDescription, status, executionMode, acknowledgementText, orderIdx } = req.body;

        if (!isValidCourseTaskStatus(status)) {
            return res.status(400).json({
                success: false,
                message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_STATUS_MESSAGE,
            });
        }
        if (
            orderIdx !== undefined &&
            (orderIdx === null ||
                orderIdx === '' ||
                !Number.isInteger(Number(orderIdx)) ||
                Number(orderIdx) < 1)
        ) {
            return res.status(400).json({
                success: false,
                message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_ORDER_IDX_MESSAGE,
            });
        }
        const parsedOrderIdx = orderIdx === undefined ? undefined : Number(orderIdx);
        if (
            executionMode !== undefined &&
            executionMode !== 'CALLABLE' &&
            executionMode !== 'STDIN'
        ) {
            return res.status(400).json({
                success: false,
                message: 'Execution mode must be CALLABLE or STDIN.'
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
            if (!isAllowedCourseTaskFile(taskFile)) {
                return res.status(400).json({
                    success: false,
                    message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_FILE_TYPE_MESSAGE,
                });
            }

            newContent = await uploadToS3(taskFile, courseTaskContentFolder);
            newContentMimeType = taskFile.mimetype;
            newContentFileName = taskFile.originalname;
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

            newThumbnail = await uploadToS3(thumbnailFile, courseTaskThumbnailsFolder);
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
            undefined,
            undefined,
            executionMode,
            acknowledgementText,
            parsedOrderIdx

        );

        if (updateCourseResponse && updateCourseResponse.success === false) {
            if (
                String(updateCourseResponse.responseAfterUpdate?.message || '') ===
                    'COURSE_TASK_ACKNOWLEDGEMENT_FOR_FILE_ONLY'
            ) {
                return res.status(400).json({
                    success: false,
                    message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_ACKNOWLEDGEMENT_FOR_FILE_ONLY_MESSAGE
                });
            }
            if (updateCourseResponse.responseAfterUpdate === 'COURSE_TASK_DUPLICATE_NAME') {
                return res.status(400).json({
                    success: false,
                    message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_DUPLICATE_NAME_MESSAGE,
                });
            }
            if (updateCourseResponse.responseAfterUpdate === 'COURSE_TASK_DUPLICATE_ORDER_IDX') {
                return res.status(400).json({
                    success: false,
                    message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_DUPLICATE_ORDER_IDX_MESSAGE,
                });
            }
            if (updateCourseResponse.responseAfterUpdate === 'COURSE_TASK_INVALID_ORDER_IDX') {
                return res.status(400).json({
                    success: false,
                    message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_ORDER_IDX_MESSAGE,
                });
            }
            if (updateCourseResponse.responseAfterUpdate === 'COURSE_TASK_NOT_FOUND') {
                return res.status(404).json({
                    success: false,
                    message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_NOT_FOUND_MESSAGE,
                });
            }
            return res.status(500).json({
                success: false,
                message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_UPDATE_ERROR_MESSAGE,
            });
        }

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
