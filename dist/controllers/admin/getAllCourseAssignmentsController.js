"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllCourseAssignmentsService_1 = __importDefault(require("../../services/admin/getAllCourseAssignmentsService"));
const courseAssignmentMessages_1 = require("../../constants/admin/courseAssignmentMessages");
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const getAllCourseAssignments = async (req, res) => {
    try {
        const { employeeId, employeeName, page, limit } = req.query;
        const result = await getAllCourseAssignmentsService_1.default.getAllCourseAssignments({
            employeeId: typeof employeeId === 'string' ? employeeId : undefined,
            employeeName: typeof employeeName === 'string' ? employeeName : undefined,
            page: typeof page === 'string' && page.trim() !== '' ? Number(page) : undefined,
            limit: typeof limit === 'string' && limit.trim() !== '' ? Number(limit) : undefined
        });
        return res.status(commonErrorMessages_1.HTTP_STATUS.OK).json({
            success: true,
            message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_SUCCESS_MESSAGES.COURSE_ASSIGNMENT_FETCH_SUCCESS_MESSAGE,
            data: result.data,
            pagination: result.pagination
        });
    }
    catch (error) {
        console.error(`Error in fetching all course assignments: ${error.message}`);
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_FETCH_ERROR_MESSAGE,
        });
    }
    ;
};
exports.default = { getAllCourseAssignments };
