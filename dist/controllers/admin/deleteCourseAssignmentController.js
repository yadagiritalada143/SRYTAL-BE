"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteCourseAssignmentService_1 = __importDefault(require("../../services/admin/deleteCourseAssignmentService"));
const courseAssignmentMessages_1 = require("../../constants/admin/courseAssignmentMessages");
const deleteCourseAssignment = async (req, res) => {
    try {
        const { courseAssignmentId } = req.params;
        if (!courseAssignmentId) {
            return res.status(400).json({
                success: false,
                message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_ID_INVALID_MESSAGE,
            });
        }
        await deleteCourseAssignmentService_1.default.deleteCourseAssignment(courseAssignmentId);
        return res.status(200).json({
            success: true,
            message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_SUCCESS_MESSAGES.COURSE_ASSIGNMENT_DELETE_SUCCESS_MESSAGE
        });
    }
    catch (error) {
        console.error(`Error in deleting course assignment: ${error.message}`);
        if (error.message === courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE) {
            return res.status(404).json({
                success: false,
                message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE,
            });
        }
        return res.status(400).json({
            success: false,
            message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DELETE_ERROR_MESSAGE,
        });
    }
    ;
};
exports.default = { deleteCourseAssignment };
