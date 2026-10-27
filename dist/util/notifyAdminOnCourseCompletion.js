"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../model/userModel"));
const coursesModel_1 = __importDefault(require("../model/coursesModel"));
const sendCourseCompletionEmail_1 = __importDefault(require("./sendCourseCompletionEmail"));
/**
 * Sends the course-completion notification to the admin who assigned the course.
 * Shared by every path that can complete a course - the employee ticking off a
 * non-coding task and the server deriving the completion of a coding task from a
 * passing submission - so the "who gets told what" rule lives in one place.
 */
const notifyAdminOnCourseCompletion = async (assignment, completedAt) => {
    try {
        const [employee, course, admin] = await Promise.all([
            userModel_1.default.findById(assignment.employeeId).lean(),
            coursesModel_1.default.findById(assignment.courseId).lean(),
            assignment.assignedByAdminId
                ? userModel_1.default.findById(assignment.assignedByAdminId).lean()
                : null
        ]);
        const adminEmail = (admin === null || admin === void 0 ? void 0 : admin.email) || process.env.ADMIN_EMAIL_ABOUT_CUSTOMER;
        if (!adminEmail) {
            console.error('[CourseCompletion] No admin email available; skipping notification.');
            return;
        }
        console.log(`[CourseCompletion] Resolved admin recipient: ${adminEmail}`);
        console.log(`[CourseCompletion] Email for assignment ${assignment._id} (employee ${assignment.employeeId}); dispatching admin notification.`);
        await sendCourseCompletionEmail_1.default.sendCourseCompletionEmail({
            adminEmail,
            adminName: admin
                ? `${admin.firstName || ''} ${admin.lastName || ''}`.trim()
                : undefined,
            employeeName: employee
                ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim()
                : 'Employee',
            courseName: course ? course.courseName : 'Course',
            completedAt
        });
    }
    catch (error) {
        console.error('[CourseCompletion] Failed to notify admin:', (error === null || error === void 0 ? void 0 : error.message) || error);
    }
};
exports.default = { notifyAdminOnCourseCompletion };
