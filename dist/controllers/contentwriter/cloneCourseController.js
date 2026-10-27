"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloneCourseService_1 = __importDefault(require("../../services/contentwriter/cloneCourseService"));
const courseMessages_1 = require("../../constants/contentwriter/courseMessages");
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const errorCodeToStatus = (code) => {
    switch (code) {
        case courseMessages_1.COURSE_CLONE_ERROR_CODES.SOURCE_NOT_FOUND:
            return commonErrorMessages_1.HTTP_STATUS.NOT_FOUND;
        case courseMessages_1.COURSE_CLONE_ERROR_CODES.SOURCE_NOT_ARCHIVED:
        case courseMessages_1.COURSE_CLONE_ERROR_CODES.INVALID_MODULE:
        case courseMessages_1.COURSE_CLONE_ERROR_CODES.INVALID_TASK:
        case courseMessages_1.COURSE_CLONE_ERROR_CODES.DUPLICATE_NAME:
            return commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST;
        default:
            return commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    }
};
const cloneCourse = async (req, res) => {
    try {
        const { courseId, courseName, modules } = req.body;
        const responseAfterCloning = await cloneCourseService_1.default.cloneCourse({
            courseId,
            courseName,
            modules
        });
        if (!responseAfterCloning.success || !responseAfterCloning.data) {
            return res
                .status(errorCodeToStatus(responseAfterCloning.code))
                .json({
                success: false,
                message: responseAfterCloning.message ||
                    courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_CLONE_ERROR_MESSAGE
            });
        }
        return res.status(commonErrorMessages_1.HTTP_STATUS.CREATED).json({
            success: true,
            message: courseMessages_1.COURSE_SUCCESS_MESSAGES.COURSE_CLONE_SUCCESS_MESSAGE,
            data: responseAfterCloning.data
        });
    }
    catch (error) {
        console.error(`Error in cloning Course: ${error}`);
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_CLONE_ERROR_MESSAGE
        });
    }
};
exports.default = { cloneCourse };
