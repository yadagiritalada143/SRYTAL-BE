import CourseModel from '../../model/coursesModel';
import { IFetchAllCoursesResponse } from '../../interfaces/courses';
import courseMedia from '../../util/manageCourseMedia';

const AllCourses = async () => {
    try {
        const courses = await CourseModel.find();

        const coursesWithThumbnailUrl = await Promise.all(
            courses.map(async (course: any) => {
                let thumbnailUrl = '';

                if (course.thumbnail) {
                    thumbnailUrl =
                        await courseMedia.getCourseMediaSignedUrl(
                            course.thumbnail
                        );
                }

                return {
                    ...course.toObject(),
                    thumbnailUrl,
                };
            })
        );

        return coursesWithThumbnailUrl;
    } catch (error) {
        console.error('Error in getting all courses:', error);
        throw error;
    }
};

export default { AllCourses };
