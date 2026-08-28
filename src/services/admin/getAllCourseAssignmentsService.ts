import CourseAssignment from '../../model/courseAssignmentModel';
import CourseModel from '../../model/coursesModel';
import UserModel from '../../model/userModel';
import courseProgress from '../../util/manageCourseProgress';
import { COURSE_ASSIGNMENT_STATUS } from '../../types/courseAssignmentStatusValues';
import { COURSE_ASSIGNMENT_ERRORS_MESSAGES } from '../../constants/admin/courseAssignmentMessages';

interface GetAllCourseAssignmentsParams {
    employeeId?: string;
    employeeName?: string;
    page?: number;
    limit?: number;
}

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
const getAllCourseAssignments = async (
    params: GetAllCourseAssignmentsParams = {}
): Promise<{ data: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
    try {
        const assignments = await CourseAssignment.find({})
            .populate({ path: 'courseId', model: CourseModel })
            .sort({ assignedAt: -1 })
            .lean();

        // An assignment whose course was deleted has nothing meaningful to show.
        const validAssignments = assignments.filter((assignment: any) => assignment.courseId);

        if (validAssignments.length === 0) {
            return {
                data: [],
                pagination: { page: Math.max(1, params.page || 1), limit: Math.max(1, params.limit || 10), total: 0, totalPages: 0 }
            };
        }

        const courseIds = validAssignments.map((assignment: any) => String(assignment.courseId._id));
        const assignmentIds = validAssignments.map((assignment: any) => String(assignment._id));
        const employeeIds = validAssignments.map((assignment: any) => assignment.employeeId);

        const [modulesByCourse, completedByAssignment, employees] = await Promise.all([
            courseProgress.getActiveModulesByCourse(courseIds),
            courseProgress.getCompletedTaskIds(assignmentIds),
            UserModel.find({ _id: { $in: employeeIds } })
                .select('firstName lastName email employeeId')
                .lean()
        ]);

        const employeeById = new Map<string, any>(
            (employees as any[]).map((employee: any) => [String(employee._id), employee])
        );

        const allModules = Array.from(modulesByCourse.values()).flat();
        const tasksByModule = await courseProgress.getActiveTasksByModule(
            allModules.map((module: any) => String(module._id))
        );

        const now = new Date();

        const enriched = validAssignments.map((assignment: any) => {
            const course = assignment.courseId;
            const modules = courseProgress.buildCourseModules(
                modulesByCourse.get(String(course._id)) || [],
                tasksByModule,
                completedByAssignment.get(String(assignment._id)) || new Map()
            );
            const progress = courseProgress.summariseProgress(modules);
            const status = courseProgress.deriveAssignmentStatus(progress.completedTasks, progress.totalTasks);

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
                isOverdue:
                    status !== COURSE_ASSIGNMENT_STATUS.COMPLETED &&
                    !!assignment.dueDate &&
                    new Date(assignment.dueDate) < now,
                totalModules: modules.length,
                progress
            };
        });

        let filtered = enriched;

        if (params.employeeId) {
            const query = params.employeeId.trim().toLowerCase();
            filtered = filtered.filter((assignment: any) => {
                const employee = assignment.employee;
                const employeeCode = employee ? String(employee.employeeCode || '').toLowerCase() : '';
                const employeeObjectId = employee ? String(employee.employeeId || '').toLowerCase() : '';

                return employeeCode.includes(query) || employeeObjectId.includes(query);
            });
        }

        if (params.employeeName) {
            const query = params.employeeName.trim().toLowerCase();
            filtered = filtered.filter((assignment: any) => {
                const employee = assignment.employee;
                if (!employee) return false;

                const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
                return (
                    fullName.includes(query) ||
                    (employee.firstName || '').toLowerCase().includes(query) ||
                    (employee.lastName || '').toLowerCase().includes(query) ||
                    (employee.employeeCode || '').toLowerCase().includes(query)
                );
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
    } catch (error: any) {
        console.error(`Error in fetching all course assignments: ${error.message}`);
        throw new Error(COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_FETCH_ERROR_MESSAGE);
    }
};

export default { getAllCourseAssignments };
