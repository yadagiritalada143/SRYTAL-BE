
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseModel from '../../model/coursesModel';
import { stripHtmlTags } from '../../util/stripHtmlTags';
import { IAddCourseModuleResponse } from '../../interfaces/coursemodule';

const addNewCourseModule = async (courseId: string, moduleName: string, moduleDescription: string, thumbnail: string, status: string, orderIdx: number): Promise<IAddCourseModuleResponse> => {
    try {

        const existingModule = await CourseModuleModel.findOne({
            courseId,
            orderIdx
        });

        if (existingModule) {
            return {
                success: false,
                message: 'DUPLICATE_ORDER_IDX'
            };
        }

        const courseModuleToSave = new CourseModuleModel({
            courseId,
            moduleName,
            moduleDescription: stripHtmlTags(moduleDescription),
            thumbnail,
            status,
            orderIdx
        });

        const result = await courseModuleToSave.save();

        await CourseModel.findByIdAndUpdate(courseId, {$currentDate: { updatedAt: true }});

        return {
            success: true,
            data: result
        };

    } catch (error: any) {
        console.error('Error in adding Module:', error);
        return { success: false };
    }
};

export default { addNewCourseModule };
