import CourseAssignment from '../../model/courseAssignmentModel';
import CourseModel from '../../model/coursesModel';
import UserModel from '../../model/userModel';
import courseMedia from '../../util/manageCourseMedia';
import courseProgress from '../../util/manageCourseProgress';
import { COURSE_ASSIGNMENT_STATUS } from '../../types/courseAssignmentStatusValues';
import { IFetchMyAssignedCourseByIdResponse } from '../../interfaces/myCourses';

/**
 * Admin view of a single course assignment: the full course -> module -> task
 * tree plus the employee's per-task completion state. Unlike the employee
 * "my course" endpoint, this is keyed only by assignment id (no employeeId
 * scoping) and additionally surfaces the assignment + employee metadata so an
 * admin can audit progress for any assigned employee.
 */
const getAdminCourseAssignmentDetails = async (
    courseAssignmentId: string
): Promise<IFetchMyAssignedCourseByIdResponse & { employee?: any }> => {
    const assignment: any = await CourseAssignment.findOne({ _id: courseAssignmentId })
        .populate({ path: 'courseId', model: CourseModel })
        .lean();

    if (!assignment || !assignment.courseId) {
        return { success: false };
    }

    const course = assignment.courseId;

    const [modulesByCourse, completedByAssignment, employee] = await Promise.all([
        courseProgress.getActiveModulesByCourse([String(course._id)]),
        courseProgress.getCompletedTaskIds([String(assignment._id)]),
        UserModel.findById(assignment.employeeId)
            .select('firstName lastName email employeeId')
            .lean()
    ]);

    const courseModules = modulesByCourse.get(String(course._id)) || [];
    const tasksByModule = await courseProgress.getActiveTasksByModule(
        courseModules.map((module: any) => String(module._id))
    );

    const modules = courseProgress.buildCourseModules(
        courseModules,
        tasksByModule,
        completedByAssignment.get(String(assignment._id)) || new Map()
    );
    const progress = courseProgress.summariseProgress(modules);
    const status = courseProgress.deriveAssignmentStatus(progress.completedTasks, progress.totalTasks);

    let thumbnailUrl = '';
    if (course.thumbnail) {
        thumbnailUrl = await courseMedia.getCourseMediaSignedUrl(course.thumbnail).catch(() => '');
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
            isOverdue:
                status !== COURSE_ASSIGNMENT_STATUS.COMPLETED &&
                !!assignment.dueDate &&
                new Date(assignment.dueDate) < new Date(),
            totalModules: modules.length,
            progress,
            modules
        }
    };
};

export default { getAdminCourseAssignmentDetails };
