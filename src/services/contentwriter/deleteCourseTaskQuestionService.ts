import CourseTaskModel from '../../model/courseTaskModel';
import TaskCodingQuestionModel from '../../model/taskCodingQuestionModel';
import CodingQuestionTestCaseModel from '../../model/codingQuestionTestCaseModel';
import CodeRunModel from '../../model/codeRunModel';
import { toQuestionIdFilter } from '../../util/courseTaskQuestions';
import { IDeleteCourseTaskQuestionResponse } from '../../interfaces/courseTask';

/**
 * Removes one question from a coding task, along with everything that hangs off
 * it: its generated test cases and every run / submission made against it. The
 * task itself, and any progress row for it, are left alone - if the removed
 * question was one the employee still had to solve, the derived completion check
 * reopens the task on their next submission, and manageCourseProgress drops a
 * question-less coding task from the denominator.
 */
const deleteCourseTaskQuestion = async (
    taskId: string,
    questionId: string
): Promise<IDeleteCourseTaskQuestionResponse> => {
    const trimmedTaskId = String(taskId || '').trim();
    const trimmedQuestionId = toQuestionIdFilter(questionId);

    try {
        const task = await CourseTaskModel.findById(trimmedTaskId).lean();

        if (!task) {
            return { success: false, notFound: true };
        }

        if (!task.isCoding) {
            return { success: false, notCodingTask: true };
        }

        if (!trimmedQuestionId) {
            return { success: false, questionNotFound: true };
        }

        const deletedQuestion = await TaskCodingQuestionModel.findOneAndDelete({
            _id: trimmedQuestionId,
            taskId: trimmedTaskId
        });

        if (!deletedQuestion) {
            return { success: false, questionNotFound: true };
        }

        // Best effort: orphaned test cases / runs would otherwise be served if the
        // question id were ever reused.
        await Promise.all([
            CodingQuestionTestCaseModel.deleteMany({ taskId: trimmedTaskId, questionId: trimmedQuestionId }),
            CodeRunModel.deleteMany({ taskId: trimmedTaskId, questionId: trimmedQuestionId })
        ]).catch((error: any) => {
            console.error(`Cleanup of removed question ${trimmedQuestionId} was incomplete: ${error?.message || error}`);
        });

        const questionCount = await TaskCodingQuestionModel.countDocuments({
            taskId: trimmedTaskId,
            status: { $ne: 'INACTIVE' }
        });

        return {
            success: true,
            taskId: trimmedTaskId,
            questionId: trimmedQuestionId,
            questionCount
        };
    } catch (error: any) {
        console.error(`Error in removing question ${questionId} from course task ${taskId}: ${error}`);
        return { success: false };
    }
};

export default { deleteCourseTaskQuestion };
