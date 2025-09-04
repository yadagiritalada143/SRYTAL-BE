import CourseTaskModel from '../../model/courseTaskModel';

const addCourseTaskService = async ( moduleId:string, taskName: string, taskDescription: string ) => {
    try {
        const CoursesTaskToSave: any = new CourseTaskModel({moduleId, taskName, taskDescription});
        const result = await CoursesTaskToSave.save();
        return result;
    } catch (error: any) {
        console.error('Error in adding course task:', error);
        return { success: false };
    }
};

export default { addCourseTaskService };
