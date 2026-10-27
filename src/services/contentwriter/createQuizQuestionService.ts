import CourseTaskModel from '../../model/courseTaskModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseModel from '../../model/coursesModel';
import CourseQuizQuestionModel from '../../model/courseQuizQuestionModel';
import { ICourseQuizQuestionOption, ICreateQuizQuestionResponse } from '../../interfaces/courseQuizQuestion';
import { CourseQuizQuestionType, CourseQuizQuestionStatus} from '../../types/courseQuizQuestiontype';

const escapeRegExp = (value: string): string => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const createQuizQuestion = async (
    taskId: string,
    question: string,
    type: CourseQuizQuestionType,
    options: ICourseQuizQuestionOption[] | undefined,
    status: CourseQuizQuestionStatus
): Promise<ICreateQuizQuestionResponse> => {
    try {
        const task: any = await CourseTaskModel.findById(taskId)
            .select('type moduleId')
            .lean();

        if (!task) {
            return { success: false, taskNotFound: true };
        }

        if (String(task.type || '').toUpperCase() !== 'QUIZ') {
            return { success: false, notQuizTask: true };
        }

        const trimmedQuestion = String(question || '').trim();

        const existingQuestion = await CourseQuizQuestionModel.findOne({
            taskId,
            isDeleted: false,
            question: { $regex: `^${escapeRegExp(trimmedQuestion)}$`, $options: 'i' }
        }).lean();

        if (existingQuestion) {
            return { success: false, duplicateQuestion: true };
        }

        const newQuestion = await CourseQuizQuestionModel.create({
            taskId,
            question,
            type,
            // TEXTAREA is free text: never persist an artificial options array.
            ...(type === 'TEXTAREA' ? {} : { options }),
            status,
            isDeleted: false,
        });

        const module: any = await CourseModuleModel.findById(task.moduleId)
            .select('courseId')
            .lean();

        if (module?.courseId) {
            await CourseModel.findByIdAndUpdate(module.courseId, {
                $currentDate: { updatedAt: true }
            });
        }

        return { success: true, question: newQuestion };
    } catch (error: any) {
        console.error(`Error in creating quiz question for task ${taskId}: ${error}`);
        return { success: false };
    }
};

export default { createQuizQuestion };
