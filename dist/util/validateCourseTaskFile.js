"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAllowedCourseTaskFile = exports.ALLOWED_COURSE_TASK_FILE_MIME_TYPES = exports.DISALLOWED_COURSE_TASK_FILE_EXTENSIONS = exports.ALLOWED_COURSE_TASK_FILE_EXTENSIONS = void 0;
const path_1 = __importDefault(require("path"));
exports.ALLOWED_COURSE_TASK_FILE_EXTENSIONS = [
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
exports.DISALLOWED_COURSE_TASK_FILE_EXTENSIONS = [
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
exports.ALLOWED_COURSE_TASK_FILE_MIME_TYPES = [
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
const isAllowedCourseTaskFile = (file) => {
    if (!file || !file.originalname) {
        return false;
    }
    const extension = path_1.default.extname(file.originalname).toLowerCase();
    if (exports.DISALLOWED_COURSE_TASK_FILE_EXTENSIONS.includes(extension)) {
        return false;
    }
    if (!exports.ALLOWED_COURSE_TASK_FILE_EXTENSIONS.includes(extension)) {
        return false;
    }
    const mimeType = String(file.mimetype || '').toLowerCase();
    return (exports.ALLOWED_COURSE_TASK_FILE_MIME_TYPES.includes(mimeType) ||
        GENERIC_MIME_TYPES.includes(mimeType));
};
exports.isAllowedCourseTaskFile = isAllowedCourseTaskFile;
exports.default = { isAllowedCourseTaskFile: exports.isAllowedCourseTaskFile, ALLOWED_COURSE_TASK_FILE_EXTENSIONS: exports.ALLOWED_COURSE_TASK_FILE_EXTENSIONS, ALLOWED_COURSE_TASK_FILE_MIME_TYPES: exports.ALLOWED_COURSE_TASK_FILE_MIME_TYPES, DISALLOWED_COURSE_TASK_FILE_EXTENSIONS: exports.DISALLOWED_COURSE_TASK_FILE_EXTENSIONS };
