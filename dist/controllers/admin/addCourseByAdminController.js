"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addCourseByAdminService_1 = __importDefault(require("../../services/admin/addCourseByAdminService"));
const courseMessages_1 = require("../../constants/admin/courseMessages");
const addCourseByAdminController = (req, res) => {
    const { courseName, courseDescription } = req.body;
    addCourseByAdminService_1.default
        .addCourseByAdminService(courseName, courseDescription)
        .then((responseAfteraddingCourse) => {
        if (responseAfteraddingCourse.id) {
            return res
                .status(201)
                .json({ message: courseMessages_1.COURSES_ADD_SUCCESS_MESSAGES.COURSE_ADD_SUCCESS_MESSAGE });
        }
        else {
            return res
                .status(400)
                .json({ message: courseMessages_1.COURSE_ERRORS_MESSAGES.COURSE_ADD_ERROR_MESSAGE });
        }
    })
        .catch((error) => {
        console.log(error);
    });
};
exports.default = { addCourseByAdminController };
