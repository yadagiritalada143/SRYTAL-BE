import CourseTaskModel from '../../model/courseTaskModel';
import { toQuestionIdFilter } from '../../util/courseTaskQuestions';
import { IUpdateCourseTaskQuestionResponse } from '../../interfaces/courseTask';

/**
 * Edits one question of a coding task - its text, description, publish state or
 * its writer-supplied starters. The update targets the single subdocument through
 * a positional operator, so the other questions on the task are never touched.
 *
 * A legacy task whose question still lives in the top-level `question` field has
 * no subdocument to update; it is reported as question-not-found so the caller
 * can tell the writer to run the backfill rather than silently doing nothing.
 */
const updateCourseTaskQuestion = async (input: {
    taskId: string;
    questionId: string;
    question?: string;
    description?: string;
    status?: string;
}): Promise<IUpdateCourseTaskQuestionResponse> => {
    const taskId = String(input.taskId || '').trim();
    const questionId = toQuestionIdFilter(input.questionId);

    try {
        const task: any = await CourseTaskModel.findById(taskId).lean();

        if (!task) {
            return { success: false, notFound: true };
        }

        if (!task.isCoding) {
            return { success: false, notCodingTask: true };
        }

        if (!questionId) {
            return { success: false, questionNotFound: true };
        }

        if (input.question !== undefined && input.question.trim() === '') {
            return { success: false };
        }

        if (input.question !== undefined) {
            const duplicate = (task.questions || []).some(
                (entry: any) =>
                    String(entry?.questionId) !== questionId &&
                    String(entry?.question || '').trim().toLowerCase() === input.question!.trim().toLowerCase()
            );

            if (duplicate) {
                return { success: false, duplicateQuestion: true };
            }
        }

        const fields: Record<string, unknown> = {};
        if (input.question !== undefined) {
            fields['questions.$.question'] = input.question.trim();
        }
        if (input.description !== undefined) {
            fields['questions.$.description'] = input.description;
        }
        if (input.status !== undefined) {
            fields['questions.$.status'] = input.status.toUpperCase();
        }

        if (Object.keys(fields).length === 0) {
            return { success: true, taskId, questionId };
        }

        const updatedTask: any = await CourseTaskModel.findOneAndUpdate(
            { _id: taskId, isCoding: true, 'questions.questionId': questionId },
            { $set: fields },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return { success: false, questionNotFound: true };
        }

        return { success: true, taskId, questionId };
    } catch (error: any) {
        console.error(`Error in updating question ${input.questionId} of course task ${taskId}: ${error}`);
        return { success: false };
    }
};

export default { updateCourseTaskQuestion };
