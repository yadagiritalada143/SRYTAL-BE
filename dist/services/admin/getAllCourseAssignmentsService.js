"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseAssignmentModel_1 = __importDefault(require("../../model/courseAssignmentModel"));
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const userModel_1 = __importDefault(require("../../model/userModel"));
const manageCourseProgress_1 = __importDefault(require("../../util/manageCourseProgress"));
const courseAssignmentStatusValues_1 = require("../../types/courseAssignmentStatusValues");
const courseAssignmentMessages_1 = require("../../constants/admin/courseAssignmentMessages");
/**
 * Every course assignment in the system, enriched the same way the admin
 * details endpoint is: each row carries the employee + course metadata, the
 * derived assignment status and an overall progress summary (completed tasks,
 * total tasks, percent complete). The full module/task tree is intentionally
 * omitted from the list to keep the payload small — it is fetched on demand by
 * getCourseAssignmentDetailsService when a single assignment is opened.
 *
 * Supports optional filtering by employeeId / employeeName and pagination
 * (page, limit).
 */
const getAllCourseAssignments = async (params = {}) => {
    try {
        const assignments = await courseAssignmentModel_1.default.find({})
            .populate({ path: 'courseId', model: coursesModel_1.default })
            .sort({ assignedAt: -1 })
            .lean();
        // An assignment whose course was deleted has nothing meaningful to show.
        const validAssignments = assignments.filter((assignment) => assignment.courseId);
        if (validAssignments.length === 0) {
            return {
                data: [],
                pagination: { page: Math.max(1, params.page || 1), limit: Math.max(1, params.limit || 10), total: 0, totalPages: 0 }
            };
        }
        const courseIds = validAssignments.map((assignment) => String(assignment.courseId._id));
        const assignmentIds = validAssignments.map((assignment) => String(assignment._id));
        const employeeIds = validAssignments.map((assignment) => assignment.employeeId);
        const [modulesByCourse, completedByAssignment, employees] = await Promise.all([
            manageCourseProgress_1.default.getActiveModulesByCourse(courseIds),
            manageCourseProgress_1.default.getCompletedTaskIds(assignmentIds),
            userModel_1.default.find({ _id: { $in: employeeIds } })
                .select('firstName lastName email employeeId')
                .lean()
        ]);
        const employeeById = new Map(employees.map((employee) => [String(employee._id), employee]));
        const allModules = Array.from(modulesByCourse.values()).flat();
        const tasksByModule = await manageCourseProgress_1.default.getActiveTasksByModule(allModules.map((module) => String(module._id)));
        const now = new Date();
        const enriched = validAssignments.map((assignment) => {
            const course = assignment.courseId;
            const modules = manageCourseProgress_1.default.buildCourseModules(modulesByCourse.get(String(course._id)) || [], tasksByModule, completedByAssignment.get(String(assignment._id)) || new Map());
            const progress = manageCourseProgress_1.default.summariseProgress(modules);
            const status = manageCourseProgress_1.default.deriveAssignmentStatus(progress.completedTasks, progress.totalTasks);
            const employee = employeeById.get(String(assignment.employeeId));
            return {
                courseAssignmentId: String(assignment._id),
                courseId: String(course._id),
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                employee: employee
                    ? {
                        employeeId: String(employee._id),
                        firstName: employee.firstName,
                        lastName: employee.lastName,
                        email: employee.email,
                        employeeCode: employee.employeeId
                    }
                    : null,
                status,
                assignedAt: assignment.assignedAt,
                dueDate: assignment.dueDate,
                completedAt: assignment.completedAt || null,
                isOverdue: status !== courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED &&
                    !!assignment.dueDate &&
                    new Date(assignment.dueDate) < now,
                totalModules: modules.length,
                progress
            };
        });
        let filtered = enriched;
        if (params.employeeId) {
            const query = params.employeeId.trim().toLowerCase();
            filtered = filtered.filter((assignment) => {
                const employee = assignment.employee;
                const employeeCode = employee ? String(employee.employeeCode || '').toLowerCase() : '';
                const employeeObjectId = employee ? String(employee.employeeId || '').toLowerCase() : '';
                return employeeCode.includes(query) || employeeObjectId.includes(query);
            });
        }
        if (params.employeeName) {
            const query = params.employeeName.trim().toLowerCase();
            filtered = filtered.filter((assignment) => {
                const employee = assignment.employee;
                if (!employee)
                    return false;
                const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
                return (fullName.includes(query) ||
                    (employee.firstName || '').toLowerCase().includes(query) ||
                    (employee.lastName || '').toLowerCase().includes(query) ||
                    (employee.employeeCode || '').toLowerCase().includes(query));
            });
        }
        const total = filtered.length;
        const page = Math.max(1, params.page || 1);
        const limit = Math.max(1, params.limit || 10);
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const data = filtered.slice(startIndex, startIndex + limit);
        return {
            data,
            pagination: { page, limit, total, totalPages }
        };
    }
    catch (error) {
        console.error(`Error in fetching all course assignments: ${error.message}`);
        throw new Error(courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_FETCH_ERROR_MESSAGE);
    }
};
exports.default = { getAllCourseAssignments };
