import path from 'path';

export const ALLOWED_COURSE_TASK_FILE_EXTENSIONS = [
    '.pdf',
    '.doc',
    '.docx',
    '.ppt',
    '.pptx',
    '.xls',
    '.xlsx',
    '.txt',
    '.csv',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
];

export const ALLOWED_COURSE_TASK_FILE_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'application/csv',
    'text/comma-separated-values',
    'image/png',
    'image/jpeg',
    'image/webp',
];

/**
 * `application/octet-stream` is the generic fallback many browsers send for
 * less common document types, so it is accepted as long as the file extension
 * is on the allow-list.
 */
const GENERIC_MIME_TYPES = ['application/octet-stream'];

/**
 * Returns true only when the uploaded file has both an allowed extension and
 * an accepted (or generic) MIME type. Used to reject prohibited types such as
 * executables and archives before they are persisted to S3.
 */
export const isAllowedCourseTaskFile = (
    file?: Express.Multer.File
): boolean => {
    if (!file || !file.originalname) {
        return false;
    }

    const extension = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_COURSE_TASK_FILE_EXTENSIONS.includes(extension)) {
        return false;
    }

    const mimeType = String(file.mimetype || '').toLowerCase();
    return (
        ALLOWED_COURSE_TASK_FILE_MIME_TYPES.includes(mimeType) ||
        GENERIC_MIME_TYPES.includes(mimeType)
    );
};

export default { isAllowedCourseTaskFile, ALLOWED_COURSE_TASK_FILE_EXTENSIONS, ALLOWED_COURSE_TASK_FILE_MIME_TYPES };
