"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const addCourseTaskService_1 = __importDefault(require("../../services/contentwriter/addCourseTaskService"));
const manageCourseMedia_1 = __importDefault(require("../../util/manageCourseMedia"));
const awsS3Config_1 = require("../../config/awsS3Config");
const coursetaskMessages_1 = require("../../constants/contentwriter/coursetaskMessages");
const validateCourseTaskFile_1 = require("../../util/validateCourseTaskFile");
/**
 * Upload file to S3 and return the stored object key.
 *
 * Existing S3 functionality is kept unchanged.
 */
const uploadToS3 = async (file, folder) => {
    const uniqueName = (0, uuid_1.v4)() + path_1.default.extname(file.originalname);
    await manageCourseMedia_1.default.uploadThumbnailToS3(uniqueName, file.buffer, file.mimetype, folder);
    return `${folder}/${uniqueName}`;
};
const addTaskToModule = async (req, res) => {
    var _a, _b, _c;
    try {
        const { moduleId, taskName, taskDescription, link, type, acknowledgementText, orderIdx } = req.body;
        if (orderIdx === undefined ||
            orderIdx === null ||
            orderIdx === '' ||
            !Number.isInteger(Number(orderIdx)) ||
            Number(orderIdx) < 1) {
            return res.status(400).json({
                success: false,
                message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_ORDER_IDX_MESSAGE
            });
        }
        const parsedOrderIdx = Number(orderIdx);
        const status = 'ACTIVE';
        const taskType = String(type || '').toUpperCase();
        if (!taskType) {
            return res.status(400).json({
                success: false,
                message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_TYPE_MESSAGE
            });
        }
        if (taskType === 'CODE') {
            if (!String(taskName || '').trim()) {
                return res.status(400).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_NAME_REQUIRED_MESSAGE
                });
            }
        }
        if (taskType === 'CODE' && !String(taskDescription || '').trim()) {
            return res.status(400).json({
                success: false,
                message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_CODING_TASK_DESCRIPTION_MESSAGE
            });
        }
        if (taskType === 'QUIZ' && !String(taskDescription || '').trim()) {
            return res.status(400).json({
                success: false,
                message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_QUIZ_TASK_MESSAGE
            });
        }
        if (taskType !== 'FILE' && String(acknowledgementText || '').trim()) {
            return res.status(400).json({
                success: false,
                message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_ACKNOWLEDGEMENT_FOR_FILE_ONLY_MESSAGE
            });
        }
        /**
         * ---------------------------------------------------------
         * Uploaded files
         * ---------------------------------------------------------
         *
         * taskFile      -> only required for FILE
         * thumbnailFile -> optional for every task type
         */
        const files = req.files;
        const taskFile = (_a = files === null || files === void 0 ? void 0 : files.taskFile) === null || _a === void 0 ? void 0 : _a[0];
        const thumbnailFile = (_b = files === null || files === void 0 ? void 0 : files.thumbnailFile) === null || _b === void 0 ? void 0 : _b[0];
        /**
         * ---------------------------------------------------------
         * Task content
         * ---------------------------------------------------------
         */
        let content = '';
        let contentMimeType = '';
        let contentFileName = '';
        /**
         * ---------------------------------------------------------
         * LINK
         * ---------------------------------------------------------
         *
         * Store the supplied link as content.
         */
        if (taskType === 'LINK') {
            content = String(link || '').trim();
            if (!content) {
                return res.status(400).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_MISSING_CONTENT_MESSAGE
                });
            }
        }
        /**
         * ---------------------------------------------------------
         * FILE
         * ---------------------------------------------------------
         *
         * Existing S3 upload functionality.
         */
        if (taskType === 'FILE') {
            if (!taskFile) {
                return res.status(400).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_MISSING_CONTENT_MESSAGE
                });
            }
            if (!(0, validateCourseTaskFile_1.isAllowedCourseTaskFile)(taskFile)) {
                return res.status(400).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_FILE_TYPE_MESSAGE
                });
            }
            content = await uploadToS3(taskFile, awsS3Config_1.courseTaskContentFolder);
            contentMimeType = taskFile.mimetype;
            contentFileName = taskFile.originalname;
        }
        /**
         * ---------------------------------------------------------
         * Thumbnail
         * ---------------------------------------------------------
         *
         * Existing S3 thumbnail upload remains unchanged.
         */
        let thumbnailPath = '';
        if (thumbnailFile) {
            thumbnailPath = await uploadToS3(thumbnailFile, awsS3Config_1.courseTaskThumbnailsFolder);
        }
        const responseAfteraddingCourseTask = await addCourseTaskService_1.default.addCourseTask(moduleId, taskName, taskDescription, thumbnailPath, status, taskType, content, contentMimeType, contentFileName, ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId) || '', parsedOrderIdx, acknowledgementText);
        if (responseAfteraddingCourseTask &&
            'success' in responseAfteraddingCourseTask &&
            responseAfteraddingCourseTask.success === false) {
            if (responseAfteraddingCourseTask.message === 'DUPLICATE_ORDER_IDX') {
                return res.status(400).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_DUPLICATE_ORDER_IDX_MESSAGE
                });
            }
            return res.status(400).json({
                success: false,
                message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_ADD_ERROR_MESSAGE
            });
        }
        return res.status(201).json({
            success: true,
            message: coursetaskMessages_1.COURSE_TASK_SUCCESS_MESSAGES.COURSE_TASK_ADD_SUCCESS_MESSAGE,
            data: responseAfteraddingCourseTask
        });
    }
    catch (error) {
        console.error(`Error in adding Task to Module: ${error}`);
        if ((error === null || error === void 0 ? void 0 : error.message) === 'USER_OPENROUTER_KEY_NOT_FOUND' ||
            (error === null || error === void 0 ? void 0 : error.message) === 'OPENROUTER_KEY_NOT_FOUND') {
            return res.status(400).json({
                success: false,
                message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_OPENROUTER_KEY_MISSING_MESSAGE
            });
        }
        if ((error === null || error === void 0 ? void 0 : error.message) === 'OPENROUTER_KEY_INVALID' || (error === null || error === void 0 ? void 0 : error.message) === 'OPENROUTER_API_KEY_INVALID_FORMAT') {
            return res.status(400).json({
                success: false,
                message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_OPENROUTER_KEY_INVALID_MESSAGE
            });
        }
        if ((error === null || error === void 0 ? void 0 : error.message) === 'CODING_TASK_DESCRIPTION_REQUIRED') {
            return res.status(400).json({
                success: false,
                message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_CODING_TASK_DESCRIPTION_MESSAGE
            });
        }
        if ((error === null || error === void 0 ? void 0 : error.message) === 'COURSE_TASK_BOILERPLATE_GENERATION_FAILED') {
            return res.status(502).json({
                success: false,
                message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_BOILERPLATE_GENERATION_ERROR_MESSAGE
            });
        }
        return res.status(500).json({ success: false, message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_ADD_ERROR_MESSAGE });
    }
};
exports.default = { addTaskToModule };
