"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseAssignmentModel_1 = __importDefault(require("../../model/courseAssignmentModel"));
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const userModel_1 = __importDefault(require("../../model/userModel"));
const manageCourseMedia_1 = __importDefault(require("../../util/manageCourseMedia"));
const manageCourseProgress_1 = __importDefault(require("../../util/manageCourseProgress"));
const courseAssignmentStatusValues_1 = require("../../types/courseAssignmentStatusValues");
/**
 * Admin view of a single course assignment: the full course -> module -> task
 * tree plus the employee's per-task completion state. Unlike the employee
 * "my course" endpoint, this is keyed only by assignment id (no employeeId
 * scoping) and additionally surfaces the assignment + employee metadata so an
 * admin can audit progress for any assigned employee.
 */
const getAdminCourseAssignmentDetails = async (courseAssignmentId) => {
    const assignment = await courseAssignmentModel_1.default.findOne({ _id: courseAssignmentId })
        .populate({ path: 'courseId', model: coursesModel_1.default })
        .lean();
    if (!assignment || !assignment.courseId) {
        return { success: false };
    }
    const course = assignment.courseId;
    const [modulesByCourse, completedByAssignment, employee] = await Promise.all([
        manageCourseProgress_1.default.getActiveModulesByCourse([String(course._id)]),
        manageCourseProgress_1.default.getCompletedTaskIds([String(assignment._id)]),
        userModel_1.default.findById(assignment.employeeId)
            .select('firstName lastName email employeeId')
            .lean()
    ]);
    const courseModules = modulesByCourse.get(String(course._id)) || [];
    const tasksByModule = await manageCourseProgress_1.default.getActiveTasksByModule(courseModules.map((module) => String(module._id)));
    const modules = manageCourseProgress_1.default.buildCourseModules(courseModules, tasksByModule, completedByAssignment.get(String(assignment._id)) || new Map());
    const progress = manageCourseProgress_1.default.summariseProgress(modules);
    const status = manageCourseProgress_1.default.deriveAssignmentStatus(progress.completedTasks, progress.totalTasks);
    let thumbnailUrl = '';
    if (course.thumbnail) {
        thumbnailUrl = await manageCourseMedia_1.default.getCourseMediaSignedUrl(course.thumbnail).catch(() => '');
    }
    return {
        success: true,
        employee: employee
            ? {
                employeeId: String(employee._id),
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                employeeCode: employee.employeeId
            }
            : null,
        course: {
            courseAssignmentId: String(assignment._id),
            courseId: String(course._id),
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnailUrl,
            status,
            assignedAt: assignment.assignedAt,
            dueDate: assignment.dueDate,
            completedAt: assignment.completedAt || null,
            isOverdue: status !== courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED &&
                !!assignment.dueDate &&
                new Date(assignment.dueDate) < new Date(),
            totalModules: modules.length,
            progress,
            modules
        }
    };
};
exports.default = { getAdminCourseAssignmentDetails };
