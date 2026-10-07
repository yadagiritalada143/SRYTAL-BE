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
            success: true,
            coursedata: courseData
        };
    } catch (error) {
        console.error(`Error in fetching course By id: ${error}`);
        return { success: false };
    }
};

export default { getCourseById };
