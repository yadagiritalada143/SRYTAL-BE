"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getMyAssignedCoursesService_1 = __importDefault(require("../../services/common/getMyAssignedCoursesService"));
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const myCoursesMessages_1 = require("../../constants/common/myCoursesMessages");
const getMyAssignedCourses = (req, res) => {
    var _a;
    getMyAssignedCoursesService_1.default
        .getMyAssignedCourses((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)
        .then(myCoursesResponse => {
        res.status(commonErrorMessages_1.HTTP_STATUS.OK).json(myCoursesResponse);
    })
        .catch(error => {
        console.error(`Error in fetching assigned courses: ${error}`);
        res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.MY_COURSES_FETCH_ERROR_MESSAGE
        });
    });
};
exports.default = { getMyAssignedCourses };
