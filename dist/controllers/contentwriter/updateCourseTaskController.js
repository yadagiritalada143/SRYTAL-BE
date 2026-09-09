"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateCourseTaskService_1 = __importDefault(require("../../services/contentwriter/updateCourseTaskService"));
const coursetaskMessages_1 = require("../../constants/contentwriter/coursetaskMessages");
const validateCourseStatusTypesUtil_1 = __importDefault(require("../../util/validateCourseStatusTypesUtil"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const manageCourseMedia_1 = __importDefault(require("../../util/manageCourseMedia"));
const awsS3Config_1 = require("../../config/awsS3Config");
const updateCourseTask = async (req, res) => {
    var _a, _b;
    try {
        const { id, taskName, taskDescription, status } = req.body;
        if (!(0, validateCourseStatusTypesUtil_1.default)(status)) {
            return res.status(400).json({
                success: false,
                message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_STATUS_MESSAGE,
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
            const { originalname, buffer, mimetype, } = taskFile;
            const uniqueName = (0, uuid_1.v4)() + path_1.default.extname(originalname);
            await manageCourseMedia_1.default.uploadThumbnailToS3(uniqueName, buffer, mimetype, awsS3Config_1.courseTaskContentFolder);
            newContent =
                `${awsS3Config_1.courseTaskContentFolder}/${uniqueName}`;
            newContentMimeType = mimetype;
            newContentFileName = originalname;
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
            const { originalname, buffer, mimetype } = thumbnailFile;
            const uniqueName = (0, uuid_1.v4)() + path_1.default.extname(originalname);
            await manageCourseMedia_1.default.uploadThumbnailToS3(uniqueName, buffer, mimetype, awsS3Config_1.courseTaskThumbnailsFolder);
            newThumbnail =
                `${awsS3Config_1.courseTaskThumbnailsFolder}/${uniqueName}`;
        }
        const updateCourseResponse = await updateCourseTaskService_1.default.updateCourseTask(id, taskName, taskDescription, newThumbnail, status.toUpperCase(), newContent, newContentMimeType, newContentFileName);
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
