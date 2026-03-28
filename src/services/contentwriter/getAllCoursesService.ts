import CourseModel from '../../model/coursesModel';
import { IFetchAllCoursesResponse } from '../../interfaces/courses';

const AllCourses = (): Promise<IFetchAllCoursesResponse> => {
  return new Promise((resolve, reject) => {
    CourseModel.find({})
      .populate({
        path: 'modules',
        populate: {
          path: 'tasks',
          model: 'CourseTaskModel',
        },
      })
      .then((courses: any) => {
        if (!courses) {
          reject({ success: false });
        } else {
          resolve({
            success: true,
            courses: courses,
          });
        }
      })
      .catch((error: any) => {
        console.error(`Error in fetching Courses: ${error}`);
        reject({ success: false });
      });
  });
};

export default { AllCourses };
