import CourseModuleModel from '../../model/coursemoduleModel';

interface updateCourseModuleResponse {
    success: boolean;
    responseAfterModuleUpdate?: any;
}

const updateCourseModule = async (id: string, moduleName: string, moduleDescription: string, status: string): Promise<updateCourseModuleResponse> => {
    try {
        const result = await CourseModuleModel.updateOne({ _id: id }, { moduleName, moduleDescription, status });
        if (!result) {
            return { success: false };
        }

        return { success: true, responseAfterModuleUpdate: result };
    } catch (error: any) {
        console.error(`Error in updating module: ${error}`);
        return { success: false, responseAfterModuleUpdate: error };
    }
}

export default { updateCourseModule };
