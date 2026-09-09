"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateCourseService_1 = __importDefault(require("../../services/contentwriter/updateCourseService"));
const courseMessages_1 = require("../../constants/contentwriter/courseMessages");
const validateCourseStatusTypesUtil_1 = __importDefault(require("../../util/validateCourseStatusTypesUtil"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const manageCourseMedia_1 = __importDefault(require("../../util/manageCourseMedia"));
const awsS3Config_1 = require("../../config/awsS3Config");
const updateCourse = async (req, res) => {
    try {
        const { id, courseName, courseDescription, status } = req.body;
        if (!(0, validateCourseStatusTypesUtil_1.default)(status)) {
            return res.status(400).json({
                success: false,
                message: courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_INVALID_STATUS_MESSAGE,
            });
        }
        let thumbnailKey = undefined;
        if (req.file) {
            const { originalname, buffer, mimetype } = req.file;
            const uniqueName = (0, uuid_1.v4)() + path_1.default.extname(originalname);
            const uploadResponse = await manageCourseMedia_1.default.uploadThumbnailToS3(uniqueName, buffer, mimetype, awsS3Config_1.coursesThumbnailsFolder).catch((error) => {
                console.error(`Error uploading thumbnail to S3: ${error}`);
                return res.status(500).json({
                    success: false,
                    message: courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_UPDATE_ERROR_MESSAGE,
                });
            });
            if (res.headersSent)
                return;
            thumbnailKey = uploadResponse.key;
        }
        const updateCourseResponse = await updateCourseService_1.default.updateCourse(id, courseName, courseDescription, thumbnailKey, status.toUpperCase());
        res.status(200).json(updateCourseResponse);
    }
    catch (error) {
        console.error(`Error in updating course: ${error}`);
        res.status(500).json({
            success: false,
            message: courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_UPDATE_ERROR_MESSAGE,
        });
    }
};
exports.default = { updateCourse };
