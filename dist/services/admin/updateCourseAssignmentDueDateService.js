"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseAssignmentModel_1 = __importDefault(require("../../model/courseAssignmentModel"));
const userModel_1 = __importDefault(require("../../model/userModel"));
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const sendCourseDueDateUpdateEmail_1 = __importDefault(require("../../util/sendCourseDueDateUpdateEmail"));
const courseAssignmentMessages_1 = require("../../constants/admin/courseAssignmentMessages");
const updateCourseAssignmentDueDate = async (id, dueDate) => {
    try {
        if (!dueDate) {
            throw new Error('Invalid due date');
        }
        const assignment = await courseAssignmentModel_1.default.findById(id);
        if (!assignment) {
            throw new Error(courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE);
        }
        const oldDueDate = assignment.dueDate;
        assignment.dueDate = dueDate;
        const result = await assignment.save();
        // Dispatch the due date update notification email. Failures here must never
        // break the due date update or the API response.
        try {
            const [employee, course] = await Promise.all([
                userModel_1.default.findById(assignment.employeeId).select('firstName lastName email').lean(),
                coursesModel_1.default.findById(assignment.courseId).select('courseName').lean()
            ]);
            if (employee && employee.email && course) {
                const isExtended = new Date(dueDate) > new Date(oldDueDate);
                await sendCourseDueDateUpdateEmail_1.default.sendCourseDueDateUpdateEmail({
                    employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.email,
                    employeeEmail: employee.email,
                    courseName: course.courseName,
                    oldDueDate,
                    newDueDate: dueDate,
                    isExtended
                });
            }
        }
        catch (emailError) {
            console.error(`Error in sending course due date update email: ${emailError.message}`);
        }
        return result;
    }
    catch (error) {
        console.error(`Error in updating course assignment due date: ${error.message}`);
        throw error;
    }
};
exports.default = { updateCourseAssignmentDueDate };
