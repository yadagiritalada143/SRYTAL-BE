"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseAssignmentModel_1 = __importDefault(require("../../model/courseAssignmentModel"));
const courseAssignmentMessages_1 = require("../../constants/admin/courseAssignmentMessages");
const deleteCourseAssignment = async (courseAssignmentId) => {
    try {
        if (!courseAssignmentId) {
            throw new Error(courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_ID_INVALID_MESSAGE);
        }
        const deletecourse = await courseAssignmentModel_1.default.findByIdAndDelete(courseAssignmentId);
        if (!deletecourse) {
            throw new Error(courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE);
        }
        return deletecourse;
    }
    catch (error) {
        console.error(`Error in deleting course assignment: ${error.message}`);
        throw error;
    }
    ;
};
exports.default = { deleteCourseAssignment };
