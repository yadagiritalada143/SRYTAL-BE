"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllCoursesService_1 = __importDefault(require("../../services/contentwriter/getAllCoursesService"));
const courseMessages_1 = require("../../constants/contentwriter/courseMessages");
const getAllCourses = (req, res) => {
    getAllCoursesService_1.default.AllCoursesService()
        .then((FetchAllCoursesResponse) => {
        res.status(200).json(FetchAllCoursesResponse);
    })
        .catch(error => {
        console.error(`Error in fetching courses: ${error}`);
        res.status(500).json({ success: false, message: courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_FETCH_ERROR_MESSAGE });
    });
};
exports.default = { getAllCourses };
