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
        let thumbnailUrl = '';

        if (course.thumbnail) {
            thumbnailUrl = await courseMedia.getCourseMediaSignedUrl(
                course.thumbnail
            );
        }
        const courseData = {
            ...course.toObject(),
            thumbnailUrl
        };

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
