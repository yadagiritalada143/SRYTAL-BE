import CourseModel from '../../model/coursesModel';
import { IFetchAllCoursesResponse } from '../../interfaces/courses';
import courseMedia from '../../util/manageCourseMedia';

const AllCourses = async () => {
    try {
        const courses = await CourseModel.find()
            .populate({
                path: 'modules',
                populate: {
                    path: 'tasks',
                    model: 'CourseTaskModel'
                }
            });

        const coursesWithThumbnailUrl = await Promise.all(
            courses.map(async (course: any) => {
                let thumbnailUrl = '';

                if (course.thumbnail) {
                    thumbnailUrl =
                        await courseMedia.getCourseMediaSignedUrl(
                            course.thumbnail
                        );
                }

                const courseData = course.toObject();

                if (Array.isArray(courseData.modules)) {
                    for (const module of courseData.modules) {
                        module.thumbnailUrl = module.thumbnail
                            ? await courseMedia.getCourseMediaSignedUrl(module.thumbnail)
                            : '';
                        if (Array.isArray(module.tasks)) {
                            for (const task of module.tasks) {
                                task.thumbnailUrl = task.thumbnail
                                    ? await courseMedia.getCourseMediaSignedUrl(task.thumbnail)
                                    : '';
                            }
                        }
                    }
                }

                return {
                    ...courseData,
                    thumbnailUrl,
                };
            })
        );

        let totalCourses = coursesWithThumbnailUrl.length;
        let totalModules = 0;
        let totalTasks = 0;

        for (const course of coursesWithThumbnailUrl) {
            const modules = Array.isArray(course.modules) ? course.modules : [];
            totalModules += modules.length;
            for (const module of modules) {
                totalTasks += Array.isArray(module.tasks) ? module.tasks.length : 0;
            }
        }

        return {
            courses: coursesWithThumbnailUrl,
            totals: { totalCourses, totalModules, totalTasks },
        };
    } catch (error) {
        console.error('Error in getting all courses:', error);
        throw error;
    }
};

export default { AllCourses };
