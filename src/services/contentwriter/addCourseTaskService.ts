import CourseTaskModel from '../../model/courseTaskModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseModel from '../../model/coursesModel';
import courseTaskBoilerplateService from '../common/courseTaskBoilerplateService';

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
    userId: string,
) => {
    const isCodingTask = String(type || '').toUpperCase() === 'CODE';

    try {
        let baseBoilerplate: string | undefined;
        if (isCodingTask) {
            try {
                baseBoilerplate = await courseTaskBoilerplateService.generateBaseBoilerplate(taskDescription, userId);
            } catch (error: any) {
                const errorCode = String(error?.message || '');
                console.error(`Error generating coding task boilerplate: ${errorCode}`);
                if (
                    errorCode === 'USER_OPENROUTER_KEY_NOT_FOUND' ||
                    errorCode === 'OPENROUTER_KEY_NOT_FOUND' ||
                    errorCode === 'OPENROUTER_KEY_INVALID' ||
                    errorCode === 'OPENROUTER_API_KEY_INVALID_FORMAT' ||
                    errorCode === 'CODING_TASK_DESCRIPTION_REQUIRED'
                ) {
                    throw error;
                }
                throw new Error('COURSE_TASK_BOILERPLATE_GENERATION_FAILED');
            }
        }

        const taskToSave = new CourseTaskModel({
            moduleId,
            taskName,
            taskDescription,
            thumbnail,
            status,
            type,
            content,
            contentMimeType,
            contentFileName,
            ...(baseBoilerplate ? { baseBoilerplate } : {})
        });

        const result = await taskToSave.save();

        const module = await CourseModuleModel.findById(moduleId).lean();

        if (module?.courseId) {
            await CourseModel.findByIdAndUpdate(
                module.courseId,
                {
                    $currentDate: {
                        updatedAt: true
                    }
                }
            );
        }
     return result;
     
    } catch (error: any) {
        console.error(`Error in adding course task: ${error}`);
        throw error;
    }
};

export default { addCourseTask };
