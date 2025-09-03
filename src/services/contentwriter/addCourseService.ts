import CourseTaskModel from '../../model/courseTaskModel';

const addCourseService = async ( courseName: string, courseDescription: string, ) => {
    try {
        const CoursesToSave: any = new CourseTaskModel({ courseName, courseDescription});
        const result = await CoursesToSave.save();
        return result;
    } catch (error: any) {
        console.error('Error in adding course:', error);
        return { success: false };
    }
};

export default { addCourseService };
