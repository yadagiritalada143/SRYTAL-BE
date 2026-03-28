import CourseModel from '../../model/coursesModel';

const addCourseByAdmin = async (
  courseName: string,
  courseDescription: string
) => {
  try {
    const CoursesToSave: any = new CourseModel({
      courseName,
      courseDescription,
    });
    const result = await CoursesToSave.save();
    return result;
  } catch (error: any) {
    console.error(`Error in adding Courses: ${error}`);
    return { success: false };
  }
};

export default { addCourseByAdmin };
