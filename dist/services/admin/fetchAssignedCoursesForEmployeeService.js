"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseAssignmentModel_1 = __importDefault(require("../../model/courseAssignmentModel"));
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const userModel_1 = __importDefault(require("../../model/userModel"));
const manageCourseProgress_1 = __importDefault(require("../../util/manageCourseProgress"));
const courseAssignmentMessages_1 = require("../../constants/admin/courseAssignmentMessages");
const fetchAssignedCoursesForEmployee = async (employeeId) => {
    const employee = await userModel_1.default
        .findById(employeeId)
        .select('firstName lastName email')
        .lean();
    if (!employee) {
        throw new Error(courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.ASSIGNED_COURSES_EMPLOYEE_NOT_FOUND_MESSAGE);
    }
    const assignments = await courseAssignmentModel_1.default
        .find({ employeeId })
        .populate({
        path: 'courseId',
        model: coursesModel_1.default
    })
        .sort({ assignedAt: -1 })
        .lean();
    const validAssignments = assignments.filter((assignment) => assignment.courseId);
    if (validAssignments.length === 0) {
        return {
            success: true,
            message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_SUCCESS_MESSAGES.ASSIGNED_COURSES_NO_COURSES_MESSAGE,
            data: []
        };
    }
    const courseIds = validAssignments.map((assignment) => String(assignment.courseId._id));
    const assignmentIds = validAssignments.map((assignment) => String(assignment._id));
    const [modulesByCourse, completedByAssignment] = await Promise.all([
        manageCourseProgress_1.default.getActiveModulesByCourse(courseIds),
        manageCourseProgress_1.default.getCompletedTaskIds(assignmentIds)
    ]);
    const allModules = Array.from(modulesByCourse.values()).flat();
    const tasksByModule = await manageCourseProgress_1.default.getActiveTasksByModule(allModules.map((module) => String(module._id)));
    const data = validAssignments.map((assignment) => {
        const course = assignment.courseId;
        const modules = manageCourseProgress_1.default.buildCourseModules(modulesByCourse.get(String(course._id)) || [], tasksByModule, completedByAssignment.get(String(assignment._id)) ||
            new Map());
        const progress = manageCourseProgress_1.default.summariseProgress(modules);
        const status = manageCourseProgress_1.default.deriveAssignmentStatus(progress.completedTasks, progress.totalTasks);
        return {
            courseAssignmentId: String(assignment._id),
            courseId: String(course._id),
            courseName: course.courseName,
            description: course.courseDescription,
            status,
            assignedDate: assignment.assignedAt,
            dueDate: assignment.dueDate,
            assignedBy: String(assignment.assignedByAdminId)
        };
    });
    return {
        success: true,
        message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_SUCCESS_MESSAGES.ASSIGNED_COURSES_FETCH_SUCCESS_MESSAGE,
        data
    };
};
exports.default = { fetchAssignedCoursesForEmployee };
