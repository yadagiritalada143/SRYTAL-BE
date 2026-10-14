import CourseQuizQuestionModel from '../../model/courseQuizQuestionModel';
import { IFetchQuizQuestionByIdResponse } from '../../interfaces/courseQuizQuestion';

/**
 * Fetches a single non-deleted quiz question by its ID. Content Writers must
 * be able to retrieve the question and its options.
 */
const getQuizQuestionById = async (questionId: string): Promise<IFetchQuizQuestionByIdResponse> => {
    try {
        const question = await CourseQuizQuestionModel.findOne({
            _id: questionId,
            isDeleted: false
        }).lean();

        if (!question) {
            return { success: false, questionNotFound: true };
        }

        return { success: true, question };
    } catch (error: any) {
        console.error(`Error in fetching quiz question ${questionId}: ${error}`);
        return { success: false };
    }
};

export default { getQuizQuestionById };
