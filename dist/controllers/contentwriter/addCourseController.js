"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addCourseService_1 = __importDefault(require("../../services/contentwriter/addCourseService"));
const courseMessages_1 = require("../../constants/contentwriter/courseMessages");
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const manageCourseMedia_1 = __importDefault(require("../../util/manageCourseMedia"));
const awsS3Config_1 = require("../../config/awsS3Config");
const addNewCourse = async (req, res) => {
    try {
        const { courseName, courseDescription } = req.body;
        let uniqueThumbnailKey = '';
        // Code to upload the thumbnail to AWS S3 //
        if (req.file) {
            const { originalname, buffer, mimetype } = req.file;
            const uniqueName = (0, uuid_1.v4)() + path_1.default.extname(originalname);
            uniqueThumbnailKey = await manageCourseMedia_1.default.uploadThumbnailToS3(uniqueName, buffer, mimetype, awsS3Config_1.coursesThumbnailsFolder)
                .then((responseAfterProfileImageUpload) => {
                return responseAfterProfileImageUpload.key;
            })
                .catch((error) => {
                console.error(`Error occured while Thumbnail Image upload: ${error}`);
                res.status(500).json({ success: false, message: 'Error updating the thumbnail' });
            });
        }
        const responseAfteraddingCourse = await addCourseService_1.default.addCourseService(courseName, courseDescription, uniqueThumbnailKey, 'ACTIVE');
        if (responseAfteraddingCourse) {
            return res.status(201).json({ message: courseMessages_1.COURSE_SUCCESS_MESSAGES.COURSE_ADD_SUCCESS_MESSAGE });
        }
        else {
            res.status(500).json({ success: false, message: courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_ADD_ERROR_MESSAGE });
        }
    }
    catch (error) {
        console.log(`Error in adding new Course: ${error}`);
        res.status(500).json({ success: false, message: courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_ADD_ERROR_MESSAGE });
    }
};
exports.default = { addNewCourse };
