"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getCourseTaskContentService_1 = __importDefault(require("../../services/contentwriter/getCourseTaskContentService"));
const manageCourseMedia_1 = __importDefault(require("../../util/manageCourseMedia"));
const coursetaskMessages_1 = require("../../constants/contentwriter/coursetaskMessages");
/**
 * Serves a task's content so it can be opened in a new browser tab.
 *  - type 'LINK': redirect (302) to the stored external URL (YouTube, blog...).
 *  - type 'FILE': stream the file from S3 inline so the browser renders it
 *    (pdf/image) or downloads it (word/etc).
 */
const getCourseTaskContent = async (req, res) => {
    try {
        const { id } = req.params;
        const { success, task } = await getCourseTaskContentService_1.default.getCourseTaskContent(id);
        if (!success || !task || !task.content) {
            return res
                .status(404)
                .json({ success: false, message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_NOT_FOUND_MESSAGE });
        }
        if (task.type === 'LINK') {
            return res.redirect(task.content);
        }
        // type === 'FILE' -> stream from S3
        const responseFromS3 = await manageCourseMedia_1.default.getCourseMediaFromS3(task.content);
        res.setHeader('Content-Type', task.contentMimeType || responseFromS3.contentType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(task.contentFileName || task.taskName || 'content')}"`);
        return res.status(200).send(responseFromS3.body);
    }
    catch (error) {
        console.error(`Error in fetching task content: ${error}`);
        return res
            .status(500)
            .json({ success: false, message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_CONTENT_FETCH_ERROR_MESSAGE });
    }
};
exports.default = { getCourseTaskContent };
