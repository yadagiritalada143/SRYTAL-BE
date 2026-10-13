import CourseModel from '../../model/coursesModel';
import { IFetchAllActiveCoursesResponse } from '../../interfaces/courses';
import courseMedia from '../../util/manageCourseMedia';

const AllActiveCourses = async (): Promise<IFetchAllActiveCoursesResponse> => {
    try {
        const courses = await CourseModel.find({ status: 'ACTIVE' });

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

        return { courses: coursesWithThumbnailUrl, totalActiveCourses: coursesWithThumbnailUrl.length };
    } catch (error) {
        console.error(`Error in getting all active courses: ${error}`);
        throw error;
    }
};

export default { AllActiveCourses };
