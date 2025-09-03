import CourseModuleModel from '../../model/coursemoduleModel';

const addNewCourseModuleService = async (courseId:string, moduleName: string, moduleDescription: string, ) => {
    try {
        const CoursesModuleToSave: any = new CourseModuleModel({courseId, moduleName, moduleDescription});
        const result = await CoursesModuleToSave.save();
        return result;
    } catch (error: any) {
        console.error('Error in adding Module:', error);
        return { success: false };
    }
};

export default { addNewCourseModuleService };
