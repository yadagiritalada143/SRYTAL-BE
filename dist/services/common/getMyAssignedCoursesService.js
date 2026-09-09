"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseAssignmentModel_1 = __importDefault(require("../../model/courseAssignmentModel"));
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const manageCourseMedia_1 = __importDefault(require("../../util/manageCourseMedia"));
const manageCourseProgress_1 = __importDefault(require("../../util/manageCourseProgress"));
const courseAssignmentStatusValues_1 = require("../../types/courseAssignmentStatusValues");
/**
 * Every course assigned to the logged-in employee, with the progress needed to
 * render the course list (percent complete, module count, overdue flag).
 * The full module/task tree is intentionally left out — it is fetched per
 * course by getMyAssignedCourseByIdService when a course is opened.
 */
const getMyAssignedCourses = async (employeeId) => {
    const assignments = await courseAssignmentModel_1.default.find({ employeeId })
        .populate({ path: 'courseId', model: coursesModel_1.default })
        .sort({ assignedAt: -1 })
        .lean();
    // An assignment whose course was deleted has nothing to show.
    const validAssignments = assignments.filter((assignment) => assignment.courseId);
    if (validAssignments.length === 0) {
        return { success: true, courses: [] };
    }
    const courseIds = validAssignments.map((assignment) => String(assignment.courseId._id));
    const assignmentIds = validAssignments.map((assignment) => String(assignment._id));
    const [modulesByCourse, completedByAssignment] = await Promise.all([
        manageCourseProgress_1.default.getActiveModulesByCourse(courseIds),
        manageCourseProgress_1.default.getCompletedTaskIds(assignmentIds)
    ]);
    const allModules = Array.from(modulesByCourse.values()).flat();
    const tasksByModule = await manageCourseProgress_1.default.getActiveTasksByModule(allModules.map((module) => String(module._id)));
    const now = new Date();
    const courses = await Promise.all(validAssignments.map(async (assignment) => {
        const course = assignment.courseId;
        const modules = manageCourseProgress_1.default.buildCourseModules(modulesByCourse.get(String(course._id)) || [], tasksByModule, completedByAssignment.get(String(assignment._id)) || new Map());
        const progress = manageCourseProgress_1.default.summariseProgress(modules);
        const status = manageCourseProgress_1.default.deriveAssignmentStatus(progress.completedTasks, progress.totalTasks);
        let thumbnailUrl = '';
        if (course.thumbnail) {
            // A broken/missing S3 object must not take the whole list down;
            // the client falls back to a generated placeholder.
            thumbnailUrl = await manageCourseMedia_1.default
                .getCourseMediaSignedUrl(course.thumbnail)
                .catch(() => '');
        }
        return {
            courseAssignmentId: String(assignment._id),
            courseId: String(course._id),
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnailUrl,
            status,
            assignedAt: assignment.assignedAt,
            dueDate: assignment.dueDate,
            completedAt: assignment.completedAt || null,
            isOverdue: status !== courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED && !!assignment.dueDate && new Date(assignment.dueDate) < now,
            totalModules: modules.length,
            progress
        };
    }));
    return { success: true, courses };
};
exports.default = { getMyAssignedCourses };
