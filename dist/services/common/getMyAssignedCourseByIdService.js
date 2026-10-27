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
 * One assigned course with its full module -> task tree and the employee's
 * completion state, for the course player. The assignment is looked up by id
 * *and* employeeId, so an employee can never read someone else's assignment.
 */
const getMyAssignedCourseById = async (courseAssignmentId, employeeId) => {
    const assignment = await courseAssignmentModel_1.default.findOne({ _id: courseAssignmentId, employeeId })
        .populate({ path: 'courseId', model: coursesModel_1.default })
        .lean();
    // Archived courses (and assignments whose course was deleted) are not made
    // available to employees.
    if (!assignment ||
        !assignment.courseId ||
        String(assignment.courseId.status || '').toUpperCase() === 'ARCHIVE') {
        return { success: false };
    }
    const course = assignment.courseId;
    const [modulesByCourse, completedByAssignment] = await Promise.all([
        manageCourseProgress_1.default.getActiveModulesByCourse([String(course._id)]),
        manageCourseProgress_1.default.getCompletedTaskIds([String(assignment._id)])
    ]);
    const courseModules = modulesByCourse.get(String(course._id)) || [];
    const tasksByModule = await manageCourseProgress_1.default.getActiveTasksByModule(courseModules.map((module) => String(module._id)));
    // Acknowledgement is stored on the assignment (already scoped to this
    // employee). The GET is read-only: it never writes an acknowledgement record.
    const modules = manageCourseProgress_1.default.withAcknowledgementState(manageCourseProgress_1.default.buildCourseModules(courseModules, tasksByModule, completedByAssignment.get(String(assignment._id)) || new Map()), assignment.taskAcknowledgements);
    const progress = manageCourseProgress_1.default.summariseProgress(modules);
    const status = manageCourseProgress_1.default.deriveAssignmentStatus(progress.completedTasks, progress.totalTasks);
    let thumbnailUrl = '';
    if (course.thumbnail) {
        thumbnailUrl = await manageCourseMedia_1.default.getCourseMediaSignedUrl(course.thumbnail).catch(() => '');
    }
    return {
        success: true,
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
exports.default = { getMyAssignedCourseById };
