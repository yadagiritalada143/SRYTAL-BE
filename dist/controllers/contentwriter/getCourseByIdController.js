"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getCourseByIdService_1 = __importDefault(require("../../services/contentwriter/getCourseByIdService"));
const courseMessages_1 = require("../../constants/contentwriter/courseMessages");
const getCourseDetailsById = (req, res) => {
    const { id } = req.params;
    getCourseByIdService_1.default.getCourseById(id)
        .then(CourseByIdResponse => {
        res.status(200).json(CourseByIdResponse);
    })
        .catch(error => {
        console.error(`Error in fetching course by Id: ${error}`);
        res.status(500).json({ success: false, message: courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_ADD_ERROR_MESSAGE });
    });
};
exports.default = { getCourseDetailsById };
