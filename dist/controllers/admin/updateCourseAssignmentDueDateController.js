"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateCourseAssignmentDueDateService_1 = __importDefault(require("../../services/admin/updateCourseAssignmentDueDateService"));
const courseAssignmentMessages_1 = require("../../constants/admin/courseAssignmentMessages");
const updateCourseAssignmentDueDate = async (req, res) => {
    try {
        const { courseAssignmentId } = req.params;
        const { dueDate } = req.body;
        if (!courseAssignmentId || !dueDate) {
            return res.status(400).json({
                success: false,
                message: 'courseAssignmentId and dueDate are required !'
            });
        }
        const assignment = await updateCourseAssignmentDueDateService_1.default.updateCourseAssignmentDueDate(courseAssignmentId, dueDate);
        res.status(200).json({
            success: true,
            message: 'Course assignment due date updated successfully !',
            data: assignment
        });
    }
    catch (error) {
        console.error(`Error in updating course assignment due date: ${error.message}`);
        if (error.message === courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE) {
            return res.status(404).json({
                success: false,
                message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE
            });
        }
        return res.status(400).json({
            success: false,
            message: 'Error occurred while updating course assignment due date !'
        });
    }
};
exports.default = { updateCourseAssignmentDueDate };
