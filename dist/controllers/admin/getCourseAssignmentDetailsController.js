"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAdminCourseAssignmentDetailsService_1 = __importDefault(require("../../services/admin/getAdminCourseAssignmentDetailsService"));
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const courseAssignmentMessages_1 = require("../../constants/admin/courseAssignmentMessages");
const getCourseAssignmentDetails = async (req, res) => {
    try {
        const { courseAssignmentId } = req.params;
        if (!courseAssignmentId) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_MISSING_FIELDS_MESSAGE
            });
        }
        const response = await getAdminCourseAssignmentDetailsService_1.default.getAdminCourseAssignmentDetails(courseAssignmentId);
        if (!response.success) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE
            });
        }
        return res.status(commonErrorMessages_1.HTTP_STATUS.OK).json({
            success: true,
            message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_SUCCESS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_FETCH_SUCCESS_MESSAGE,
            data: response
        });
    }
    catch (error) {
        console.error(`Error in fetching course assignment details: ${error}`);
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_FETCH_ERROR_MESSAGE
        });
    }
};
exports.default = { getCourseAssignmentDetails };
