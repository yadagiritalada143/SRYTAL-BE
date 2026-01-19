"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateCourseService_1 = __importDefault(require("../../services/contentwriter/updateCourseService"));
const courseMessages_1 = require("../../constants/contentwriter/courseMessages");
const validateCourseStatusTypesUtil_1 = __importDefault(require("../../util/validateCourseStatusTypesUtil"));
const updateCourseController = async (req, res) => {
    try {
        const { id, courseName, courseDescription, thumbnail, status } = req.body;
        if (!(0, validateCourseStatusTypesUtil_1.default)(status)) {
            return res.status(400).json({
                success: false,
                message: courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_INVALID_STATUS_MESSAGE,
            });
        }
        const updateCourseResponse = await updateCourseService_1.default.updateCourse(id, courseName, courseDescription, thumbnail, status.toUpperCase());
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
exports.default = { updateCourseController };
