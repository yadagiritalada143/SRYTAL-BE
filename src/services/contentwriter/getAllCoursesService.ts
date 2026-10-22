import CourseModel from '../../model/coursesModel';
import { IFetchAllCoursesResponse } from '../../interfaces/courses';
import courseMedia from '../../util/manageCourseMedia';
import { COURSE_MODULE_CREATION_ORDER, COURSE_TASK_CREATION_ORDER } from '../../constants/courseOrdering';

const AllCourses = async () => {
    try {
        const courses = await CourseModel.find()
            .populate({
                path: 'modules',
                options: { sort: COURSE_MODULE_CREATION_ORDER },
                populate: {
                    path: 'tasks',
                    model: 'CourseTaskModel',
                    options: { sort: COURSE_TASK_CREATION_ORDER }
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

        const totalCourses = coursesWithThumbnailUrl.length; 
        let totalModules = 0; 
        let totalTasks = 0; 
        let totalActiveModules = 0;
        let totalArchivedModules = 0;
        let totalActiveTasks = 0;
        let totalArchivedTasks = 0;
        const totalActiveCourses = coursesWithThumbnailUrl.filter( (course: any) => course.status?.toUpperCase() === 'ACTIVE' ).length; 
        const totalArchivedCourses = coursesWithThumbnailUrl.filter( (course: any) => course.status?.toUpperCase() === 'ARCHIVE' ).length; 
        for (const course of coursesWithThumbnailUrl) { 
            const modules = Array.isArray(course.modules) ? course.modules : []; 
            totalModules += modules.length; 
            for (const module of modules) { 
                if (module.status?.toUpperCase() === 'ACTIVE') totalActiveModules++; 
                else if (module.status?.toUpperCase() === 'ARCHIVE') totalArchivedModules++; 
                const tasks = Array.isArray(module.tasks) ? module.tasks : []; 
                totalTasks += tasks.length; 
                for (const task of tasks) { 
                    if (task.status?.toUpperCase() === 'ACTIVE') totalActiveTasks++; 
                    else if (task.status?.toUpperCase() === 'ARCHIVE') totalArchivedTasks++; 
                } 
            } 
        } 
                return { courses: coursesWithThumbnailUrl, 
                    totals: { 
                        totalCourses, 
                        totalModules, 
                        totalTasks, 
                        totalActiveCourses, 
                        totalArchivedCourses, 
                        totalActiveModules, 
                        totalArchivedModules, 
                        totalActiveTasks, 
                        totalArchivedTasks 
                    } 
                };   
                 
            } catch (error) {
        console.error('Error in getting all courses:', error);
        throw error;
    }
};

export default { AllCourses };
