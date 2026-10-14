import CourseQuizQuestionModel from '../../model/courseQuizQuestionModel';
import CourseTaskModel from '../../model/courseTaskModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseModel from '../../model/coursesModel';
import { ICourseQuizQuestionResponse } from '../../interfaces/courseQuizQuestion';

const isValidObjectId = (value: string): boolean => /^[0-9a-fA-F]{24}$/.test(String(value || ''));

/**
 * Shows or hides a quiz question without deleting it. The question must exist
 * and belong to a QUIZ task the Content Writer can manage.
 */
const updateQuizQuestionStatus = async (
    questionId: string,
    status: string
): Promise<ICourseQuizQuestionResponse> => {
    try {
        if (!questionId || !isValidObjectId(questionId)) {
            return { success: false, invalidQuestionId: true };
        }

        const normalizedStatus = String(status || '').toUpperCase();
        if (normalizedStatus !== 'SHOW' && normalizedStatus !== 'HIDE') {
            return { success: false, invalidStatus: true };
        }

        const existing: any = await CourseQuizQuestionModel.findOne({
            _id: questionId,
            isDeleted: false,
        }).lean();

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

        const updated = await CourseQuizQuestionModel.findByIdAndUpdate(
            questionId,
            { status: normalizedStatus },
            { new: true }
        ).lean();

        if (task.moduleId) {
            const module: any = await CourseModuleModel.findById(task.moduleId).select('courseId').lean();
            if (module?.courseId) {
                await CourseModel.findByIdAndUpdate(module.courseId, { $currentDate: { updatedAt: true } });
            }
        }

        return { success: true, question: updated };
    } catch (error: any) {
        console.error(`Error in updating quiz question status: ${error}`);
        return { success: false };
    }
};

export default { updateQuizQuestionStatus };
