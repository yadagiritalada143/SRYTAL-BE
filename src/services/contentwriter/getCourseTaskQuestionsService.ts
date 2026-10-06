import CourseTaskModel from '../../model/courseTaskModel';
import TaskCodingQuestionModel from '../../model/taskCodingQuestionModel';
import { resolveQuestions, isQuestionActive } from '../../util/courseTaskQuestions';
import { IFetchCourseTaskQuestionsResponse } from '../../interfaces/courseTask';

/**
 * Every question of a coding task, as the authoring UI needs it: the text, the
 * description, whether it is published, and which per-language starters the
 * writer supplied. Goes through the shared resolver, so a task authored before
 * the multi-question change still reports its single question.
 */
const getCourseTaskQuestions = async (taskId: string): Promise<IFetchCourseTaskQuestionsResponse> => {
    const trimmedTaskId = String(taskId || '').trim();

    try {
        const task: any = await CourseTaskModel.findById(trimmedTaskId)
            .select('taskName isCoding questions question starterCode taskDescription')
            .lean();

        if (!task) {
            return { success: false, notFound: true };
        }

        const persistedQuestions = await TaskCodingQuestionModel.find({
            taskId: task._id
        })
            .sort({ order: 1 })
            .lean();

        const questions = persistedQuestions.length > 0
            ? persistedQuestions.map((question: any) => ({
                questionId: String(question._id),
                question: question.question,
                description: question.description || '',
                status: question.status === 'INACTIVE' ? 'ARCHIVE' : question.status,
                order: question.order,
                starterCode: question.starterCode || []
            }))
            : resolveQuestions(task);

        return {
            success: true,
            taskId: trimmedTaskId,
            taskName: task.taskName,
            isCoding: Boolean(task.isCoding),
            questions,
            questionCount: questions.length,
            activeQuestionCount: questions.filter(isQuestionActive).length
        };
    } catch (error: any) {
        console.error(`Error in fetching the questions of course task ${taskId}: ${error}`);
        return { success: false };
    }
};

export default { getCourseTaskQuestions };
