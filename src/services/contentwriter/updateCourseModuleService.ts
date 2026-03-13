import CourseModuleModel from '../../model/coursemoduleModel';
import { IUpdateCourseModuleResponse } from '../../interfaces/coursemodule';

const updateCourseModule = async (id: string, moduleName: string, moduleDescription: string, thumbnail: string, status: string): Promise<IUpdateCourseModuleResponse> => {
    try {
        const result = await CourseModuleModel.updateOne({ _id: id }, { moduleName, moduleDescription, thumbnail, status });
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
