import CourseModuleModel from '../../model/coursemoduleModel';

interface updateCourseModuleResponse {
    success: boolean;
    responseAfterUpdate?: any;
}

const updateCourseModule = async (id: string, moduleName: string, moduleDescription: string, status: string): Promise<updateCourseModuleResponse> => {
    try {
        const result = await CourseModuleModel.updateMany({ _id: id }, { moduleName, moduleDescription, status });
        if (!result) {
            return { success: false };
        }

        return { success: true, responseAfterUpdate: result };
    } catch (error: any) {
        console.error(`Error in updating module: ${error}`);
        return { success: false, responseAfterUpdate: error };
    }
}

export default { updateCourseModule };
