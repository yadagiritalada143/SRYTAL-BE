"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addCourseModuleService_1 = __importDefault(require("../../services/contentwriter/addCourseModuleService"));
const coursemoduleMessages_1 = require("../../constants/contentwriter/coursemoduleMessages");
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const manageCourseMedia_1 = __importDefault(require("../../util/manageCourseMedia"));
const awsS3Config_1 = require("../../config/awsS3Config");
const addModuleToCourse = async (req, res) => {
    try {
        const { courseId, moduleName, moduleDescription } = req.body;
        let uniqueThumbnailKey = '';
        // Code to upload the thumbnail to AWS S3 //
        if (req.file) {
            const { originalname, buffer, mimetype } = req.file;
            const uniqueName = (0, uuid_1.v4)() + path_1.default.extname(originalname);
            uniqueThumbnailKey = await manageCourseMedia_1.default.uploadThumbnailToS3(uniqueName, buffer, mimetype, awsS3Config_1.courseModuleThumbnailsFolder)
                .then((responseAfterProfileImageUpload) => {
                return responseAfterProfileImageUpload.key;
            })
                .catch((error) => {
                console.log(`Error occured while Thumbnail Image upload: ${error}`);
                res.status(500).json({ success: false, message: 'Error updating the thumbnail' });
            });
        }
        const responseAfteraddingCourseModule = await addCourseModuleService_1.default.addNewCourseModuleService(courseId, moduleName, moduleDescription, uniqueThumbnailKey, 'ACTIVE');
        if (responseAfteraddingCourseModule) {
            return res.status(201).json({ message: coursemoduleMessages_1.COURSE_MODULE_SUCCESS_MESSAGES.COURSE_MODULE_ADD_SUCCESS_MESSAGE });
        }
        else {
            return res.status(500).json({ message: coursemoduleMessages_1.COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_ADD_ERROR_MESSAGE });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: coursemoduleMessages_1.COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_ADD_ERROR_MESSAGE });
    }
};
exports.default = { addModuleToCourse };
