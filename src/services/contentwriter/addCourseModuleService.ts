import CourseModuleModel from '../../model/coursemoduleModel';
import CourseModel from '../../model/coursesModel';
import { stripHtmlTags } from '../../util/stripHtmlTags';

const addNewCourseModule = async (courseId: string, moduleName: string, moduleDescription: string, thumbnail: string, status: string) => {
    try {
        const CoursesModuleToSave: any = new CourseModuleModel({ courseId, moduleName, moduleDescription: stripHtmlTags(moduleDescription), thumbnail, status });
        const result = await CoursesModuleToSave.save();

        // Touch the parent course so its updatedAt reflects this activity.
        await CourseModel.findByIdAndUpdate(courseId, { $currentDate: { updatedAt: true } });

        return result;
    } catch (error: any) {
        console.error('Error in adding Module:', error);
        return { success: false };
    }
};

export default { addNewCourseModule };
