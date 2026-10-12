import CourseModel from '../../model/coursesModel';
import { IFetchCourseByIdResponse } from '../../interfaces/courses';
import courseMedia from '../../util/manageCourseMedia';

const getCourseById = async (id: string): Promise<IFetchCourseByIdResponse> => {
    try {
        const course = await CourseModel.findById(id)
            .populate({
                path: 'modules',
                populate: {
                    path: 'tasks',
                    model: 'CourseTaskModel'
                }
            })

        if (!course) {
            return { success: false };

        }
        const courseData = course.toObject() as any;
        courseData.thumbnailUrl = course.thumbnail
            ? await courseMedia.getCourseMediaSignedUrl(course.thumbnail)
            : '';

        let totalModules = 0;
        let totalTasks = 0;
        let totalActiveModules = 0;
        let totalArchivedModules = 0;
        let totalActiveTasks = 0;
        let totalArchivedTasks = 0;

        if (Array.isArray(courseData.modules)) {
            totalModules = courseData.modules.length;
            for (const module of courseData.modules) {
                module.thumbnailUrl = module.thumbnail
                    ? await courseMedia.getCourseMediaSignedUrl(module.thumbnail)
                    : '';
                if (module.status?.toUpperCase() === 'ACTIVE') totalActiveModules++;
                else if (module.status?.toUpperCase() === 'ARCHIVE') totalArchivedModules++;
                if (Array.isArray(module.tasks)) {
                    totalTasks += module.tasks.length;
                    for (const task of module.tasks) {
                        task.thumbnailUrl = task.thumbnail
                            ? await courseMedia.getCourseMediaSignedUrl(task.thumbnail)
                            : '';
                        if (task.status?.toUpperCase() === 'ACTIVE') totalActiveTasks++;
                        else if (task.status?.toUpperCase() === 'ARCHIVE') totalArchivedTasks++;
                    }
                }
            }
        }

        return {
            success: true,
            coursedata: courseData,
            totals: {
                totalModules,
                totalTasks,
                totalActiveModules,
                totalArchivedModules,
                totalActiveTasks,
                totalArchivedTasks
            }
        };
    } catch (error) {
        console.error(`Error in fetching course By id: ${error}`);
        return { success: false };
    }
};

export default { getCourseById };
