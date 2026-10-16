import CourseAssignment from '../../model/courseAssignmentModel';
import CourseModel from '../../model/coursesModel';
import courseMedia from '../../util/manageCourseMedia';
import courseProgress from '../../util/manageCourseProgress';
import { COURSE_ASSIGNMENT_STATUS } from '../../types/courseAssignmentStatusValues';
import { IFetchMyAssignedCoursesResponse, IMyAssignedCourseSummary } from '../../interfaces/myCourses';

const getMyAssignedCourses = async (employeeId: string): Promise<IFetchMyAssignedCoursesResponse> => {
    const assignments = await CourseAssignment.find({ employeeId })
        .populate({ path: 'courseId', model: CourseModel })
        .sort({ assignedAt: -1 })
        .lean();

    const validAssignments = assignments.filter(
        (assignment: any) =>
            assignment.courseId &&
            String(assignment.courseId.status || '').toUpperCase() !== 'ARCHIVE'
    );

    if (validAssignments.length === 0) {
        return { success: true, courses: [] };
    }

    const courseIds = validAssignments.map((assignment: any) => String(assignment.courseId._id));
    const assignmentIds = validAssignments.map((assignment: any) => String(assignment._id));

    const [modulesByCourse, completedByAssignment] = await Promise.all([
        courseProgress.getActiveModulesByCourse(courseIds),
        courseProgress.getCompletedTaskIds(assignmentIds)
    ]);

    const allModules = Array.from(modulesByCourse.values()).flat();
    const tasksByModule = await courseProgress.getActiveTasksByModule(
        allModules.map((module: any) => String(module._id))
    );

    const now = new Date();

    const courses: IMyAssignedCourseSummary[] = await Promise.all(
        validAssignments.map(async (assignment: any) => {
            const course = assignment.courseId;
            const modules = courseProgress.buildCourseModules(
                modulesByCourse.get(String(course._id)) || [],
                tasksByModule,
                completedByAssignment.get(String(assignment._id)) || new Map()
            );
            const progress = courseProgress.summariseProgress(modules);
            const status = courseProgress.deriveAssignmentStatus(
                progress.completedTasks,
                progress.totalTasks
            );

            let thumbnailUrl = '';
            if (course.thumbnail) {
                thumbnailUrl = await courseMedia
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
                isOverdue:
                    status !== COURSE_ASSIGNMENT_STATUS.COMPLETED && !!assignment.dueDate && new Date(assignment.dueDate) < now,
                totalModules: modules.length,
                progress
            };
        })
    );

    return { success: true, courses };
};

export default { getMyAssignedCourses };
