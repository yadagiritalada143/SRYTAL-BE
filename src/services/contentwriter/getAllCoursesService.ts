import CourseModel from '../../model/coursesModel';
import { IFetchAllCoursesResponse } from '../../interfaces/courses';
import courseMedia from '../../util/manageCourseMedia';

// const AllCourses = (): Promise<IFetchAllCoursesResponse> => {
//     return new Promise((resolve, reject) => {
//         CourseModel.find({})
//             .populate({
//                 path: 'modules',
//                 populate: {
//                     path: 'tasks',
//                     model: 'CourseTaskModel'
//                 }
//             })
//             .then((courses: any) => {
//                 if (!courses) {
//                     reject({ success: false });
//                 } else {
//                     resolve({
//                         success: true,
//                         courses: courses
//                     });
//                 }
//             })
//             .catch((error: any) => {
//                 console.error(`Error in fetching Courses: ${error}`);
//                 reject({ success: false });
//             });
//     });
// };

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
