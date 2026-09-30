import CourseTaskModel from '../../model/courseTaskModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseModel from '../../model/coursesModel';
import { parseQuestionsField, ACTIVE_QUESTION_STATUS } from '../../util/courseTaskQuestions';

const addCourseTask = async (
    moduleId: string,
    taskName: string,
    taskDescription: string,
    thumbnail: string,
    status: string,
    type: string,
    content: string,
    contentMimeType: string,
    contentFileName: string,
    isCoding: boolean = false,
    question: string = '',
    questions: unknown = []
) => {
    try {

        const isCodingTask = Boolean(isCoding);

        // A content writer can send every question of a coding task at once, or
        // none at all and attach them later through /addCourseTaskQuestion.
        const preparedQuestions = isCodingTask ? parseQuestionsField(questions) : [];

        // Clients migrating from the single-question form still post one
        // `question`. Normalise it into questions[0] so every new task is stored
        // in the new shape. New tasks never write the top-level `question` or
        // `starterCode` fields: those are only read for tasks that predate this
        // change and go away with the legacy fallback in the next release.
        if (isCodingTask && preparedQuestions.length === 0) {
            const singleQuestion = String(question || '').trim();
            if (singleQuestion) {
                preparedQuestions.push({
                    question: singleQuestion,
                    description: taskDescription,
                    status: ACTIVE_QUESTION_STATUS,
                    order: 0,
                    starterCode: []
                });
            }
        }

        const taskToSave: any = new CourseTaskModel({
            moduleId,
            taskName,
            taskDescription,
            thumbnail,
            status,
            type,
            content,
            contentMimeType,
            contentFileName,
            isCoding: isCodingTask,
            ...(preparedQuestions.length > 0 ? { questions: preparedQuestions } : {})
        });

        const result = await taskToSave.save();

        // Propagate activity up: touch the parent course's updatedAt.
        const module = await CourseModuleModel.findById(moduleId).lean();
        if (module?.courseId) {
            await CourseModel.findByIdAndUpdate(module.courseId, { $currentDate: { updatedAt: true } });
        }

        return result;
    } catch (error: any) {
        console.error('Error in adding course task:', error);
        return { success: false };
    }
};

export default { addCourseTask };
