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

export const DISALLOWED_COURSE_TASK_FILE_EXTENSIONS = [
    '.exe',
    '.bat',
    '.cmd',
    '.com',
    '.cpl',
    '.scr',
    '.msi',
    '.msp',
    '.dll',
    '.sys',
    '.sh',
    '.ps1',
    '.psm1',
    '.jar',
    '.app',
    '.deb',
    '.rpm',
    '.apk',
    '.bin',
    '.vbs',
    '.wsf',
    '.hta',
    '.lnk',
    '.reg',
    '.pif',
    '.gadget',
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

const GENERIC_MIME_TYPES = ['application/octet-stream'];

export const isAllowedCourseTaskFile = (
    file?: Express.Multer.File
): boolean => {
    if (!file || !file.originalname) {
        return false;
    }

    const extension = path.extname(file.originalname).toLowerCase();
    if (DISALLOWED_COURSE_TASK_FILE_EXTENSIONS.includes(extension)) {
        return false;
    }

    if (!ALLOWED_COURSE_TASK_FILE_EXTENSIONS.includes(extension)) {
        return false;
    }

    const mimeType = String(file.mimetype || '').toLowerCase();
    return (
        ALLOWED_COURSE_TASK_FILE_MIME_TYPES.includes(mimeType) ||
        GENERIC_MIME_TYPES.includes(mimeType)
    );
};

export default { isAllowedCourseTaskFile, ALLOWED_COURSE_TASK_FILE_EXTENSIONS, ALLOWED_COURSE_TASK_FILE_MIME_TYPES, DISALLOWED_COURSE_TASK_FILE_EXTENSIONS };
