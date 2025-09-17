import CourseModuleModel from '../../model/coursemoduleModel';

const addNewCourseModuleService = async (courseId:string, moduleName: string, moduleDescription: string,thumbnail: string, status: string ) => {
    try {
        const CoursesModuleToSave: any = new CourseModuleModel({courseId, moduleName, moduleDescription, thumbnail, status});
        const result = await CoursesModuleToSave.save();
        return result;
    } catch (error: any) {
        console.error('Error in adding Module:', error);
        return { success: false };
    }
};

export default { addNewCourseModuleService };
