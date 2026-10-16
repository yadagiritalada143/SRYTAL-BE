import CourseQuizQuestionModel from '../../model/courseQuizQuestionModel';
import CourseTaskModel from '../../model/courseTaskModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseModel from '../../model/coursesModel';
import { ICourseQuizQuestionResponse } from '../../interfaces/courseQuizQuestion';

/**
 * Soft deletes a quiz question by flagging `isDeleted: true`. The document is
 * never physically removed and soft-deleted questions are excluded from the
 * existing list/read/take queries which all filter on `isDeleted: false`.
 * The owning task must exist and be a QUIZ task.
 */
const deleteQuizQuestion = async (questionId: string): Promise<ICourseQuizQuestionResponse> => {
    try {
        if (!questionId) {
            return { success: false, invalidQuestionId: true };
        }

        const existing: any = await CourseQuizQuestionModel.findOne({_id: questionId, isDeleted: false }).lean();

        if (!existing) {
            return { success: false, questionNotFound: true };
        }

        const task: any = await CourseTaskModel.findById(existing.taskId).select('type moduleId').lean();
        if (!task) {
            return { success: false, taskNotFound: true };
        }
        if (String(task.type || '').toUpperCase() !== 'QUIZ') {
            return { success: false, notQuizTask: true };
        }

        const deleted = await CourseQuizQuestionModel.findByIdAndUpdate(questionId, { isDeleted: true }, { new: true }).lean();

        if (task.moduleId) {
            const module: any = await CourseModuleModel.findById(task.moduleId).select('courseId').lean();
            if (module?.courseId) {
                await CourseModel.findByIdAndUpdate(module.courseId, { $currentDate: { updatedAt: true } });
            }
        }

        return { success: true, question: deleted };
    } catch (error: any) {
        console.error(`Error in deleting quiz question ${questionId}: ${error}`);
        return { success: false };
    }
};

export default { deleteQuizQuestion };
