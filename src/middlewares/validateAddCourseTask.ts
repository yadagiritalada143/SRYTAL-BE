import { Request, Response, NextFunction } from 'express';
import { COURSE_TASK_ERRORS_MESSAGES } from '../constants/contentwriter/coursetaskMessages';
import addCourseTaskSchema from './schemas/addCourseTaskSchema';

const validateAddCourseTask = (req: Request, res: Response, next: NextFunction): void => {
    const files = req.files as Record<string, Express.Multer.File[] | undefined> | undefined;
    const { error, value } = addCourseTaskSchema.validate(
        {
            ...req.body,
            taskFileUploaded: Boolean(files?.taskFile?.[0]),
            hasThumbnail: Boolean(files?.thumbnailFile?.[0]),
            thumbnailMimeType: files?.thumbnailFile?.[0]?.mimetype
        },
        {
            abortEarly: false,
            stripUnknown: true
        }
    );

    if (error) {
        res.status(400).json({
            success: false,
            message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_VALIDATION_ERROR_MESSAGE,
            errors: error.details.map((detail) => detail.message)
        });
        return;
    }

    req.body = value;
    next();
};

export default validateAddCourseTask;
