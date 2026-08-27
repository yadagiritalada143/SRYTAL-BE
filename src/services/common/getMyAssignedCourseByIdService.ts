import CourseAssignment from '../../model/courseAssignmentModel';
import CourseModel from '../../model/coursesModel';
import courseMedia from '../../util/manageCourseMedia';
import courseProgress from '../../util/manageCourseProgress';
import { COURSE_ASSIGNMENT_STATUS } from '../../types/courseAssignmentStatusValues';
import { IFetchMyAssignedCourseByIdResponse } from '../../interfaces/myCourses';

/**
 * One assigned course with its full module -> task tree and the employee's
 * completion state, for the course player. The assignment is looked up by id
 * *and* employeeId, so an employee can never read someone else's assignment.
 */
const getMyAssignedCourseById = async (
    courseAssignmentId: string,
    employeeId: string
): Promise<IFetchMyAssignedCourseByIdResponse> => {
    const assignment: any = await CourseAssignment.findOne({ _id: courseAssignmentId, employeeId })
        .populate({ path: 'courseId', model: CourseModel })
        .lean();

    if (!assignment || !assignment.courseId) {
        return { success: false };
    }

    const course = assignment.courseId;

    const [modulesByCourse, completedByAssignment] = await Promise.all([
        courseProgress.getActiveModulesByCourse([String(course._id)]),
        courseProgress.getCompletedTaskIds([String(assignment._id)])
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

export default { getMyAssignedCourseById };
