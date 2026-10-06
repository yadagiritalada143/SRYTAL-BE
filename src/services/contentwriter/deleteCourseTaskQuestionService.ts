import CourseTaskModel from '../../model/courseTaskModel';
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
        const task: any = await CourseTaskModel.findById(trimmedTaskId).lean();

        if (!task) {
            return { success: false, notFound: true };
        }

        if (!task.isCoding) {
            return { success: false, notCodingTask: true };
        }

        if (!trimmedQuestionId) {
            return { success: false, questionNotFound: true };
        }

        const updatedTask: any = await CourseTaskModel.findOneAndUpdate(
            { _id: trimmedTaskId, isCoding: true, 'questions.questionId': trimmedQuestionId },
            { $pull: { questions: { questionId: trimmedQuestionId } } },
            { new: true }
        );

        if (!updatedTask) {
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

        const remaining = Array.isArray(updatedTask.questions) ? updatedTask.questions : [];

        // Older tasks may still carry a top-level `question` that is the fallback
        // read for a task with no questions[]. Only clear it - never write a new
        // mirror - otherwise a deleted question would silently reappear through the
        // legacy fallback after the last question is removed.
        await CourseTaskModel.updateOne(
            { _id: trimmedTaskId, question: { $exists: true, $nin: [null, ''] } },
            { $set: { question: '' } }
        ).catch(() => undefined);

        return {
            success: true,
            taskId: trimmedTaskId,
            questionId: trimmedQuestionId,
            questionCount: remaining.length
        };
    } catch (error: any) {
        console.error(`Error in removing question ${questionId} from course task ${taskId}: ${error}`);
        return { success: false };
    }
};

export default { deleteCourseTaskQuestion };
