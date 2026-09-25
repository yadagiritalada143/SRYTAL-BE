"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fetchAssignedCoursesForEmployeeService_1 = __importDefault(require("../../services/admin/fetchAssignedCoursesForEmployeeService"));
const courseAssignmentMessages_1 = require("../../constants/admin/courseAssignmentMessages");
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const fetchAssignedCoursesForEmployee = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await fetchAssignedCoursesForEmployeeService_1.default.fetchAssignedCoursesForEmployee(userId);
        return res.status(commonErrorMessages_1.HTTP_STATUS.OK).json({
            success: result.success,
            message: result.message,
            data: result.data
        });
    }
    catch (error) {
        console.error(`Error in fetching assigned courses for employee: ${error.message}`);
        if (error.message === courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.ASSIGNED_COURSES_EMPLOYEE_NOT_FOUND_MESSAGE) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.ASSIGNED_COURSES_EMPLOYEE_NOT_FOUND_MESSAGE
            });
        }
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.ASSIGNED_COURSES_FETCH_ERROR_MESSAGE
        });
    }
};
exports.default = { fetchAssignedCoursesForEmployee };
