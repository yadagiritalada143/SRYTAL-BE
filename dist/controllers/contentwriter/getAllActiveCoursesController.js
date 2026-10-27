"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllActiveCoursesService_1 = __importDefault(require("../../services/contentwriter/getAllActiveCoursesService"));
const courseMessages_1 = require("../../constants/contentwriter/courseMessages");
const getAllActiveCourses = async (req, res) => {
    try {
        const data = await getAllActiveCoursesService_1.default.AllActiveCourses();
        return res.status(200).json({
            success: true,
            message: courseMessages_1.COURSE_SUCCESS_MESSAGES.ACTIVE_COURSES_FETCH_SUCCESS_MESSAGE,
            courses: data.courses,
            totalActiveCourses: data.totalActiveCourses,
        });
    }
    catch (error) {
        console.error(`Error in fetching active courses: ${error}`);
        res.status(500).json({ success: false, message: courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_FETCH_ERROR_MESSAGE });
    }
};
exports.default = { getAllActiveCourses };
