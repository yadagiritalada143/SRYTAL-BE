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
const addTaskToModule = async (req, res) => {
    var _a, _b;
    try {
        const { moduleId, taskName, taskDescription, link } = req.body;
        const status = 'ACTIVE';
        //get uploaded files 
        //  taskFile       -> PDF, Word, Video, etc.
        //  thumbnailFile  -> JPG, PNG, WEBP, etc.
        const files = req.files;
        const taskFile = (_a = files === null || files === void 0 ? void 0 : files.taskFile) === null || _a === void 0 ? void 0 : _a[0];
        const thumbnailFile = (_b = files === null || files === void 0 ? void 0 : files.thumbnailFile) === null || _b === void 0 ? void 0 : _b[0];
        // A task's content is flexible: either an uploaded file (pdf/word/any)
        // or an external link (YouTube, blog, etc).
        let type = 'LINK';
        let content = link || '';
        let contentMimeType = '';
        let contentFileName = '';
        // Thumbnail path
        let thumbnailPath = '';
        // When a file is uploaded, push it to S3 and store the object key.
        if (taskFile) {
            const { originalname, buffer, mimetype } = taskFile;
            const uniqueName = (0, uuid_1.v4)() + path_1.default.extname(originalname);
            const s3Key = `${awsS3Config_1.courseTaskContentFolder}/${uniqueName}`;
            await manageCourseMedia_1.default.uploadThumbnailToS3(uniqueName, buffer, mimetype, awsS3Config_1.courseTaskContentFolder);
            type = 'FILE';
            content = s3Key;
            contentMimeType = mimetype;
            contentFileName = originalname;
        }
        if (thumbnailFile) {
            const { originalname, buffer, mimetype } = thumbnailFile;
            const uniqueName = (0, uuid_1.v4)() + path_1.default.extname(originalname);
            thumbnailPath = `${awsS3Config_1.courseTaskThumbnailsFolder}/${uniqueName}`;
            await manageCourseMedia_1.default.uploadThumbnailToS3(uniqueName, buffer, mimetype, awsS3Config_1.courseTaskThumbnailsFolder);
        }
        if (!content) {
            return res
                .status(400).json({ success: false, message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_MISSING_CONTENT_MESSAGE });
        }
        const responseAfteraddingCourseTask = await addCourseTaskService_1.default.addCourseTask(moduleId, taskName, taskDescription, thumbnailPath, status, type, content, contentMimeType, contentFileName);
        if (responseAfteraddingCourseTask && responseAfteraddingCourseTask.id) {
            return res.status(201).json({
                message: coursetaskMessages_1.COURSE_TASK_SUCCESS_MESSAGES.COURSE_TASK_ADD_SUCCESS_MESSAGE,
                taskId: responseAfteraddingCourseTask.id,
                taskName: responseAfteraddingCourseTask.taskName,
                taskDescription: responseAfteraddingCourseTask.taskDescription,
                type: responseAfteraddingCourseTask.type,
            });
        }
        return res
            .status(400)
            .json({ message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_ADD_ERROR_MESSAGE });
    }
    catch (error) {
        console.error(`Error in adding Task to Module: ${error}`);
        return res
            .status(500)
            .json({ success: false, message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_ADD_ERROR_MESSAGE });
    }
};
exports.default = { addTaskToModule };
