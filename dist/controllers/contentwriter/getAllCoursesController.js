"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllCoursesService_1 = __importDefault(require("../../services/contentwriter/getAllCoursesService"));
const courseMessages_1 = require("../../constants/contentwriter/courseMessages");
const getAllCourses = async (req, res) => {
    try {
        const data = await getAllCoursesService_1.default.AllCourses();
        return res.status(200).json({
            success: true,
            courses: data.courses,
            totals: data.totals,
        });
    }
    catch (error) {
        console.error(`Error in fetching courses: ${error}`);
        res.status(500).json({ success: false, message: courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_FETCH_ERROR_MESSAGE });
    }
};
exports.default = { getAllCourses };
