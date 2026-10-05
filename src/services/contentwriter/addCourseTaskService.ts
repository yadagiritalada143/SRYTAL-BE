import CourseTaskModel from '../../model/courseTaskModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseModel from '../../model/coursesModel';
import TaskCodingQuestionModel from '../../model/taskCodingQuestionModel';
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
        // `question`. Normalize it into the separate question collection.
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
            isCoding: isCodingTask
        });

        const result = await taskToSave.save();

        const savedQuestions = preparedQuestions.length > 0
            ? await TaskCodingQuestionModel.create(
                preparedQuestions.map((preparedQuestion) => ({
                    taskId: result._id,
                    question: preparedQuestion.question,
                    description: preparedQuestion.description,
                    status: preparedQuestion.status,
                    order: preparedQuestion.order,
                    starterCode: []
                }))
            )
            : [];

        // Propagate activity up: touch the parent course's updatedAt.
        const module = await CourseModuleModel.findById(moduleId).lean();
        if (module?.courseId) {
            await CourseModel.findByIdAndUpdate(module.courseId, { $currentDate: { updatedAt: true } });
        }

        if (savedQuestions.length === 0) {
            return result;
        }

        const taskResult =
            typeof result.toObject === 'function'
                ? result.toObject()
                : result;

        return {
            ...taskResult,
            questions: savedQuestions.map((savedQuestion: any) => ({
                questionId: String(savedQuestion._id),
                question: savedQuestion.question,
                description: savedQuestion.description,
                status: savedQuestion.status,
                order: savedQuestion.order
            }))
        };
    } catch (error: any) {
        console.error('Error in adding course task:', error);
        return { success: false };
    }
};

export default { addCourseTask };
