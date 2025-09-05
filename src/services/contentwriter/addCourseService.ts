import CourseModel from '../../model/coursesModel';

const addCourseService = async (courseName: string, courseDescription: string, status:string ) => {
    try {
        const CourseToSave: any = new CourseModel({ courseName, courseDescription, status });
        const result = await CourseToSave.save();
        return result;
    } catch (error: any) {
        console.error('Error in adding new course:', error);
        return { success: false };
    }
};

export default { addCourseService };
