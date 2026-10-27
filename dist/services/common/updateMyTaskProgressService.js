"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseAssignmentModel_1 = __importDefault(require("../../model/courseAssignmentModel"));
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const taskProgressModel_1 = __importDefault(require("../../model/taskProgressModel"));
const manageCourseProgress_1 = __importDefault(require("../../util/manageCourseProgress"));
const courseAssignmentStatusValues_1 = require("../../types/courseAssignmentStatusValues");
const userModel_1 = __importDefault(require("../../model/userModel"));
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const sendCourseCompletionEmail_1 = __importDefault(require("../../util/sendCourseCompletionEmail"));
/**
 * Marks a single task of an assigned course complete/incomplete for the logged-in
 * employee, then re-derives the assignment status from the resulting counts
 * (Assigned -> In Progress -> Completed) so the two can never disagree.
 */
const updateMyTaskProgress = async (courseAssignmentId, taskId, isCompleted, employeeId) => {
    // Scoping by employeeId is what stops one employee writing progress onto
    // another employee's assignment.
    const assignment = await courseAssignmentModel_1.default.findOne({ _id: courseAssignmentId, employeeId }).lean();
    if (!assignment) {
        return { success: false, notFound: true };
    }
    const task = await courseTaskModel_1.default.findById(taskId).lean();
    if (!task) {
        return { success: false, invalidTask: true };
    }
    // The task must live under a module of the assigned course, otherwise an
    // employee could tick off tasks from a course they were never assigned.
    const parentModule = await coursemoduleModel_1.default.findById(task.moduleId).lean();
    if (!parentModule || String(parentModule.courseId) !== String(assignment.courseId)) {
        return { success: false, invalidTask: true };
    }
    const completedAt = isCompleted ? new Date() : null;
    await taskProgressModel_1.default.findOneAndUpdate({ courseAssignmentId, moduleId: parentModule._id, taskId }, { $set: { isCompleted, completedAt } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    const [modulesByCourse, completedByAssignment] = await Promise.all([
        manageCourseProgress_1.default.getActiveModulesByCourse([String(assignment.courseId)]),
        manageCourseProgress_1.default.getCompletedTaskIds([String(assignment._id)])
    ]);
    const courseModules = modulesByCourse.get(String(assignment.courseId)) || [];
    const tasksByModule = await manageCourseProgress_1.default.getActiveTasksByModule(courseModules.map((module) => String(module._id)));
    const modules = manageCourseProgress_1.default.buildCourseModules(courseModules, tasksByModule, completedByAssignment.get(String(assignment._id)) || new Map());
    const progress = manageCourseProgress_1.default.summariseProgress(modules);
    const courseStatus = manageCourseProgress_1.default.deriveAssignmentStatus(progress.completedTasks, progress.totalTasks);
    const previousStatus = assignment.status;
    const nowCompleted = courseStatus === courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED &&
        previousStatus !== courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED;
    await courseAssignmentModel_1.default.updateOne({ _id: assignment._id }, {
        $set: {
            status: courseStatus,
            completedAt: courseStatus === courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED
                ? assignment.completedAt || new Date()
                : null
        }
    });
    if (nowCompleted) {
        console.log(`[CourseCompletion] Transition to Completed detected for assignment ${assignment._id} (employee ${assignment.employeeId}); dispatching admin notification.`);
        void notifyAdminOnCourseCompletion(assignment, courseStatus === courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED
            ? assignment.completedAt || new Date()
            : new Date());
    }
    else {
        console.log(`[CourseCompletion] No completion transition (status=${courseStatus}, previous=${previousStatus}); no email sent.`);
    }
    return {
        success: true,
        courseStatus,
        progress,
        task: { taskId, isCompleted, completedAt }
    };
};
//  Sends a course-completion notification to the admin who assigned the course
const notifyAdminOnCourseCompletion = async (assignment, completedAt) => {
    try {
        const [employee, course, admin] = await Promise.all([
            userModel_1.default.findById(assignment.employeeId).lean(),
            coursesModel_1.default.findById(assignment.courseId).lean(),
            assignment.assignedByAdminId
                ? userModel_1.default.findById(assignment.assignedByAdminId).lean()
                : null
        ]);
        const adminEmail = (admin && admin.email) ||
            process.env.ADMIN_EMAIL_ABOUT_CUSTOMER;
        if (!adminEmail) {
            console.error('[CourseCompletion] No admin email available; skipping notification.');
            return;
        }
        console.log(`[CourseCompletion] Resolved admin recipient: ${adminEmail}`);
        await sendCourseCompletionEmail_1.default.sendCourseCompletionEmail({
            adminEmail,
            adminName: admin ? `${admin.firstName || ''} ${admin.lastName || ''}`.trim() : undefined,
            employeeName: employee ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() : 'Employee',
            courseName: course ? course.courseName : 'Course',
            completedAt
        });
    }
    catch (error) {
        console.error('[CourseCompletion] Failed to notify admin:', (error === null || error === void 0 ? void 0 : error.message) || error);
    }
};
exports.default = { updateMyTaskProgress };
