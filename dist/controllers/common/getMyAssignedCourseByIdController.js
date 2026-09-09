"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getMyAssignedCourseByIdService_1 = __importDefault(require("../../services/common/getMyAssignedCourseByIdService"));
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const myCoursesMessages_1 = require("../../constants/common/myCoursesMessages");
const getMyAssignedCourseById = async (req, res) => {
    var _a;
    try {
        const { courseAssignmentId } = req.params;
        const myCourseResponse = await getMyAssignedCourseByIdService_1.default.getMyAssignedCourseById(courseAssignmentId, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        if (!myCourseResponse.success) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.MY_COURSE_NOT_FOUND_MESSAGE
            });
        }
        return res.status(commonErrorMessages_1.HTTP_STATUS.OK).json(myCourseResponse);
    }
    catch (error) {
        console.error(`Error in fetching assigned course by id: ${error}`);
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.MY_COURSE_FETCH_ERROR_MESSAGE
        });
    }
};
exports.default = { getMyAssignedCourseById };
