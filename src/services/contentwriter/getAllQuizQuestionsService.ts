import CourseTaskModel from '../../model/courseTaskModel';
import CourseQuizQuestionModel from '../../model/courseQuizQuestionModel';
import { IFetchAllQuizQuestionsResponse } from '../../interfaces/courseQuizQuestion';

/**
 * Returns every non-deleted question that belongs to a QUIZ task, in a stable
 * authoring order. Content Writers are shown both SHOW and HIDE questions, so
 * no status filter is applied here.
 */
const getAllQuizQuestions = async (taskId: string): Promise<IFetchAllQuizQuestionsResponse> => {
    try {
        const task: any = await CourseTaskModel.findById(taskId)
            .select('type')
            .lean();

        if (!task) {
            return { success: false, taskNotFound: true };
        }

        if (String(task.type || '').toUpperCase() !== 'QUIZ') {
            return { success: false, notQuizTask: true };
        }

        // createdAt keeps authoring order; _id breaks ties for questions created
        // within the same millisecond so the order is always deterministic.
        const questions = await CourseQuizQuestionModel.find({
            taskId,
            isDeleted: false,
        })
            .sort({ createdAt: 1, _id: 1 })
            .lean();

        return { success: true, questions };
    } catch (error: any) {
        console.error(`Error in fetching quiz questions for task ${taskId}: ${error}`);
        return { success: false };
    }
};

export default { getAllQuizQuestions };
