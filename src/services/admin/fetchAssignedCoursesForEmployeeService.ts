import CourseAssignment from '../../model/courseAssignmentModel';
import CourseModel from '../../model/coursesModel';
import UserModel from '../../model/userModel';
import courseProgress from '../../util/manageCourseProgress';
import { IAssignedCourseForEmployee, IFetchAssignedCoursesForEmployeeResponse } from '../../interfaces/courseAssignment';
import { COURSE_ASSIGNMENT_ERRORS_MESSAGES, COURSE_ASSIGNMENT_SUCCESS_MESSAGES } from '../../constants/admin/courseAssignmentMessages';

const fetchAssignedCoursesForEmployee = async (employeeId: string): Promise<IFetchAssignedCoursesForEmployeeResponse> => {
    const employee = await UserModel
        .findById(employeeId)
        .select('firstName lastName email')
        .lean();

    if (!employee) {
        throw new Error(
            COURSE_ASSIGNMENT_ERRORS_MESSAGES.ASSIGNED_COURSES_EMPLOYEE_NOT_FOUND_MESSAGE
        );
    }

    const assignments = await CourseAssignment
        .find({ employeeId })
        .populate({
            path: 'courseId',
            model: CourseModel
        })
        .sort({ assignedAt: -1 })
        .lean();

    const validAssignments = assignments.filter(
        (assignment: any) => assignment.courseId
    );

    if (validAssignments.length === 0) {
        return {
            success: true,
            message: COURSE_ASSIGNMENT_SUCCESS_MESSAGES.ASSIGNED_COURSES_NO_COURSES_MESSAGE,
            data: []
        };
    }

    const courseIds = validAssignments.map(
        (assignment: any) => String(assignment.courseId._id)
    );

    const assignmentIds = validAssignments.map(
        (assignment: any) => String(assignment._id)
    );

    const [modulesByCourse, completedByAssignment] = await Promise.all([
        courseProgress.getActiveModulesByCourse(courseIds),
        courseProgress.getCompletedTaskIds(assignmentIds)
    ]);

    const allModules = Array.from(modulesByCourse.values()).flat();

    const tasksByModule = await courseProgress.getActiveTasksByModule(
        allModules.map((module: any) => String(module._id))
    );

    const data: IAssignedCourseForEmployee[] = validAssignments.map(
        (assignment: any) => {
            const course = assignment.courseId;

            const modules = courseProgress.buildCourseModules(
                modulesByCourse.get(String(course._id)) || [],
                tasksByModule,
                completedByAssignment.get(String(assignment._id)) ||
                    new Map()
            );

            const progress = courseProgress.summariseProgress(modules);

            const status = courseProgress.deriveAssignmentStatus(
                progress.completedTasks,
                progress.totalTasks
            );

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
        }
    );

    return {
        success: true,
        message: COURSE_ASSIGNMENT_SUCCESS_MESSAGES.ASSIGNED_COURSES_FETCH_SUCCESS_MESSAGE,
        data
    };
};

export default { fetchAssignedCoursesForEmployee };
