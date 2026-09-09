"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseAssignmentModel_1 = __importDefault(require("../../model/courseAssignmentModel"));
const userModel_1 = __importDefault(require("../../model/userModel"));
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const manageCourseProgress_1 = __importDefault(require("../../util/manageCourseProgress"));
const sendCourseAssignmentEmail_1 = __importDefault(require("../../util/sendCourseAssignmentEmail"));
const courseAssignmentMessages_1 = require("../../constants/admin/courseAssignmentMessages");
const createCourseAssignment = async (courseId, employeeId, assignedByAdminId, dueDate) => {
    try {
        if (!courseId) {
            throw new Error('Invalid course ID');
        }
        if (!employeeId) {
            throw new Error('Invalid employee ID');
        }
        const existingAssignment = await courseAssignmentModel_1.default.findOne({ courseId, employeeId });
        if (existingAssignment) {
            throw new Error(courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_ALREADY_ASSIGNED_MESSAGE);
        }
        ;
        const newCourseAssignment = new courseAssignmentModel_1.default({ courseId, employeeId, assignedByAdminId, status: 'Assigned', assignedAt: new Date(), dueDate, completedAt: null });
        const result = await newCourseAssignment.save();
        // Dispatch the assignment notification email. Failures here must never
        // break the assignment creation or the API response.
        try {
            const [employee, course, modulesByCourse] = await Promise.all([
                userModel_1.default.findById(employeeId).select('firstName lastName email').lean(),
                coursesModel_1.default.findById(courseId).select('courseName courseDescription').lean(),
                manageCourseProgress_1.default.getActiveModulesByCourse([String(courseId)])
            ]);
            const modules = (modulesByCourse.get(String(courseId)) || []).map((module) => ({
                moduleName: module.moduleName,
                moduleDescription: module.moduleDescription
            }));
            let assignedByAdminName;
            if (assignedByAdminId) {
                const admin = await userModel_1.default.findById(assignedByAdminId).select('firstName lastName').lean();
                if (admin) {
                    assignedByAdminName = `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || undefined;
                }
            }
            if (employee && employee.email && course) {
                await sendCourseAssignmentEmail_1.default.sendCourseAssignmentEmail({
                    employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.email,
                    employeeEmail: employee.email,
                    courseName: course.courseName,
                    courseDescription: course.courseDescription,
                    modules,
                    dueDate,
                    assignedByAdminName
                });
            }
        }
        catch (emailError) {
            console.error(`Error in sending course assignment email: ${emailError.message}`);
        }
        return result;
    }
    catch (error) {
        console.error(`Error in creating course assignment: ${error.message}`);
        throw error;
    }
    ;
};
exports.default = { createCourseAssignment };
