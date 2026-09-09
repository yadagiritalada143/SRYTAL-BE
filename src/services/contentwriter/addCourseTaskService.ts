import CourseTaskModel from '../../model/courseTaskModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseModel from '../../model/coursesModel';

const addCourseTask = async (
    moduleId: string,
    taskName: string,
    taskDescription: string,
    thumbnail: string,
    status: string,
    type: string,
    content: string,
    contentMimeType: string,
    contentFileName: string,
) => {
    try {

        let thumbnailPath = '';
        const CoursesTaskToSave: any = new CourseTaskModel({
            moduleId,
            taskName,
            taskDescription,
            thumbnail,
            status,
            type,
            content,
            contentMimeType,
            contentFileName,
        });
        
        const result = await CoursesTaskToSave.save();

        // Propagate activity up: touch the parent course's updatedAt.
        const module = await CourseModuleModel.findById(moduleId).lean();
        if (module?.courseId) {
            await CourseModel.findByIdAndUpdate(module.courseId, { $currentDate: { updatedAt: true } });
        }

        return result;
    } catch (error: any) {
        console.error('Error in adding course task:', error);
        return { success: false };
    }
};

export default { addCourseTask };

