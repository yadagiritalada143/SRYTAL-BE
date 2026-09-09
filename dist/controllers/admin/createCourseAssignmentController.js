"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createCourseAssignmentService_1 = __importDefault(require("../../services/admin/createCourseAssignmentService"));
const courseAssignmentMessages_1 = require("../../constants/admin/courseAssignmentMessages");
const createCourseAssignment = async (req, res) => {
    var _a;
    try {
        const { courseId, employeeId, dueDate } = req.body;
        const assignedByAdminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!courseId || !employeeId || !dueDate) {
            return res.status(400).json({
                success: false,
                message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_MISSING_FIELDS_MESSAGE
            });
        }
        const courseAssignment = await createCourseAssignmentService_1.default.createCourseAssignment(courseId, employeeId, assignedByAdminId, dueDate);
        res.status(201).json({
            success: true,
            message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_SUCCESS_MESSAGES.COURSE_ASSIGNMENT_CREATE_SUCCESS_MESSAGE,
            data: courseAssignment
        });
    }
    catch (error) {
        console.error(`Error in creating course assignment: ${error.message}`);
        if (error.message === courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_ALREADY_ASSIGNED_MESSAGE) {
            return res.status(409).json({
                success: false,
                message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_ALREADY_ASSIGNED_MESSAGE,
            });
        }
        return res.status(400).json({
            success: false,
            message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_CREATE_ERROR_MESSAGE,
        });
    }
    ;
};
exports.default = { createCourseAssignment };
