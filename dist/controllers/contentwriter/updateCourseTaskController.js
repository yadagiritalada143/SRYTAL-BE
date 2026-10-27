"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateCourseTaskService_1 = __importDefault(require("../../services/contentwriter/updateCourseTaskService"));
const coursetaskMessages_1 = require("../../constants/contentwriter/coursetaskMessages");
const validateCourseTaskStatusTypesUtil_1 = __importDefault(require("../../util/validateCourseTaskStatusTypesUtil"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const manageCourseMedia_1 = __importDefault(require("../../util/manageCourseMedia"));
const awsS3Config_1 = require("../../config/awsS3Config");
const validateCourseTaskFile_1 = require("../../util/validateCourseTaskFile");
// Uploads one multer file to the given S3 folder under a unique name and
// returns the object key.
const uploadToS3 = async (file, folder) => {
    const uniqueName = (0, uuid_1.v4)() + path_1.default.extname(file.originalname);
    await manageCourseMedia_1.default.uploadThumbnailToS3(uniqueName, file.buffer, file.mimetype, folder);
    return `${folder}/${uniqueName}`;
};
const updateCourseTask = async (req, res) => {
    var _a, _b, _c;
    try {
        const { id, taskName, taskDescription, status, executionMode, acknowledgementText, orderIdx } = req.body;
        if (!(0, validateCourseTaskStatusTypesUtil_1.default)(status)) {
            return res.status(400).json({
                success: false,
                message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_STATUS_MESSAGE,
            });
        }
        if (orderIdx !== undefined &&
            (orderIdx === null ||
                orderIdx === '' ||
                !Number.isInteger(Number(orderIdx)) ||
                Number(orderIdx) < 1)) {
            return res.status(400).json({
                success: false,
                message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_ORDER_IDX_MESSAGE,
            });
        }
        const parsedOrderIdx = orderIdx === undefined ? undefined : Number(orderIdx);
        if (executionMode !== undefined &&
            executionMode !== 'CALLABLE' &&
            executionMode !== 'STDIN') {
            return res.status(400).json({
                success: false,
                message: 'Execution mode must be CALLABLE or STDIN.'
            });
        }
        const files = req.files;
        const taskFile = (_a = files === null || files === void 0 ? void 0 : files.taskFile) === null || _a === void 0 ? void 0 : _a[0];
        const thumbnailFile = (_b = files === null || files === void 0 ? void 0 : files.thumbnailFile) === null || _b === void 0 ? void 0 : _b[0];
        let newContent;
        let newContentMimeType;
        let newContentFileName;
        let newThumbnail;
        if (taskFile) {
            if (!(0, validateCourseTaskFile_1.isAllowedCourseTaskFile)(taskFile)) {
                return res.status(400).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_FILE_TYPE_MESSAGE,
                });
            }
            newContent = await uploadToS3(taskFile, awsS3Config_1.courseTaskContentFolder);
            newContentMimeType = taskFile.mimetype;
            newContentFileName = taskFile.originalname;
        }
        if (thumbnailFile) {
            const allowedThumbnailTypes = [
                'image/jpeg',
                'image/png',
                'image/webp',
            ];
            if (!allowedThumbnailTypes.includes(thumbnailFile.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_THUMBNAIL_TYPE_MESSAGE,
                });
            }
            newThumbnail = await uploadToS3(thumbnailFile, awsS3Config_1.courseTaskThumbnailsFolder);
        }
        const updateCourseResponse = await updateCourseTaskService_1.default.updateCourseTask(id, taskName, taskDescription, newThumbnail, status.toUpperCase(), newContent, newContentMimeType, newContentFileName, undefined, undefined, executionMode, acknowledgementText, parsedOrderIdx);
        if (updateCourseResponse && updateCourseResponse.success === false) {
            if (String(((_c = updateCourseResponse.responseAfterUpdate) === null || _c === void 0 ? void 0 : _c.message) || '') ===
                'COURSE_TASK_ACKNOWLEDGEMENT_FOR_FILE_ONLY') {
                return res.status(400).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_ACKNOWLEDGEMENT_FOR_FILE_ONLY_MESSAGE
                });
            }
            if (updateCourseResponse.responseAfterUpdate === 'COURSE_TASK_DUPLICATE_NAME') {
                return res.status(400).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_DUPLICATE_NAME_MESSAGE,
                });
            }
            if (updateCourseResponse.responseAfterUpdate === 'COURSE_TASK_DUPLICATE_ORDER_IDX') {
                return res.status(400).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_DUPLICATE_ORDER_IDX_MESSAGE,
                });
            }
            if (updateCourseResponse.responseAfterUpdate === 'COURSE_TASK_INVALID_ORDER_IDX') {
                return res.status(400).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_ORDER_IDX_MESSAGE,
                });
            }
            if (updateCourseResponse.responseAfterUpdate === 'COURSE_TASK_NOT_FOUND') {
                return res.status(404).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_NOT_FOUND_MESSAGE,
                });
            }
            return res.status(500).json({
                success: false,
                message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_UPDATE_ERROR_MESSAGE,
            });
        }
        res.status(200).json(updateCourseResponse);
    }
    catch (error) {
        console.error(`Error in updating course task: ${error}`);
        res.status(500).json({
            success: false,
            message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_UPDATE_ERROR_MESSAGE,
        });
    }
};
exports.default = { updateCourseTask };
