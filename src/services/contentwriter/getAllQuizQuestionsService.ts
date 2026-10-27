import CourseTaskModel from '../../model/courseTaskModel';
import CourseQuizQuestionModel from '../../model/courseQuizQuestionModel';
import { IFetchAllQuizQuestionsResponse } from '../../interfaces/courseQuizQuestion';

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
