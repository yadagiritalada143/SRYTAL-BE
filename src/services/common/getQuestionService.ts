import CourseTaskModel from '../../model/courseTaskModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseAssignment from '../../model/courseAssignmentModel';
import TaskCodingQuestionModel from '../../model/taskCodingQuestionModel';
import ProgrammingLanguages from '../../model/programmingLanguagesModel';
import CodeRunModel from '../../model/codeRunModel';
import generateBoilerplateService from './generateBoilerplateService';
import { normalizeLanguage, getFallbackLanguages } from '../../util/languageUtils';
import { ILastSubmittedCode } from '../../interfaces/codingQuestion';

const getQuestion = async (taskId: string, questionId: string, languageId: string, employeeId: string): Promise<any> => {

    try {

        if (!taskId || !questionId || !languageId || !employeeId) {
            return { success: false, invalidRequest: true };
        }

        /*
         * ---------------------------------------------------------
         * 2. Find Course Task
         * ---------------------------------------------------------
         */
        const task: any = await CourseTaskModel.findById(taskId).lean();

        if (!task) {
            return { success: false, notFound: true };
        }

        /*
         * ---------------------------------------------------------
         * 4. Find Course Module
         * ---------------------------------------------------------
         */

        const module: any = await CourseModuleModel.findById(task.moduleId).select('courseId').lean();

        if (!module?.courseId) {
            return { success: false, notFound: true };
        }

        /*
         * ---------------------------------------------------------
         * 5. Verify Employee Assignment
         * ---------------------------------------------------------
         */

        const assignment = await CourseAssignment
            .findOne({ employeeId, courseId: module.courseId }).lean();

        if (!assignment) {
            return { success: false, notAssigned: true };
        }

        /*
         * ---------------------------------------------------------
         * 6. Find Question
         *
         * Questions are stored in:
         *
         * task-coding-questions
         *
         * taskId + questionId guarantees that the question
         * belongs to the requested task.
         * ---------------------------------------------------------
         */

        const question: any =
            await TaskCodingQuestionModel
                .findOne({
                    _id: questionId,
                    taskId,
                    status: 'ACTIVE'
                })
                .lean();

        if (!question) {
            return {
                success: false,
                questionNotFound: true
            };
        }

        /*
         * ---------------------------------------------------------
         * 7. Find Selected Programming Language
         * ---------------------------------------------------------
         */

        const language: any =
            await ProgrammingLanguages
                .findOne({
                    _id: languageId,
                    isActive: { $ne: false }
                })
                .select(
                    '_id languageName canonicalKey isActive'
                )
                .lean();

        if (!language) {
            return {
                success: false,
                invalidLanguage: true
            };
        }

        /*
         * ---------------------------------------------------------
         * 8. Resolve Language
         * ---------------------------------------------------------
         */

        const resolvedLanguage =
            normalizeLanguage(
                language.canonicalKey ||
                language.languageName
            );

        if (!resolvedLanguage) {
            return {
                success: false,
                invalidLanguage: true
            };
        }

        /*
         * ---------------------------------------------------------
         * 9. Get Available Languages
         * ---------------------------------------------------------
         *
         * Currently returns all active programming languages.
         * ---------------------------------------------------------
         */

        const languageDocs: any[] =
            await ProgrammingLanguages
                .find({
                    isActive: { $ne: false }
                })
                .select(
                    '_id languageName canonicalKey displayOrder'
                )
                .sort({
                    displayOrder: 1
                })
                .lean();

        const allowedLanguages =
            languageDocs.length > 0
                ? languageDocs.map(
                    (item: any) => ({
                        languageId: String(item._id),
                        languageName: item.languageName,
                        canonicalKey:
                            item.canonicalKey || ''
                    })
                )
                : getFallbackLanguages().map(
                    (languageName: string) => ({
                        languageId: '',
                        languageName,
                        canonicalKey:
                            normalizeLanguage(languageName) || ''
                    })
                );

        /*
         * ---------------------------------------------------------
         * 10. Find Latest Submitted Code
         * ---------------------------------------------------------
         *
         * Identity:
         *
         * taskId
         * questionId
         * employeeId
         * languageId
         * type = submit
         * ---------------------------------------------------------
         */

        let lastSubmittedCode: ILastSubmittedCode | null = null;

        const submission: any = await CodeRunModel.findOne({ taskId, questionId, userId: employeeId, languageId, type: 'submit' }).sort({updatedAt: -1}).lean();

        if (
            submission &&
            typeof submission.sourceCode === 'string' &&
            submission.sourceCode.length > 0
        ) {
            lastSubmittedCode = {
                language: resolvedLanguage,
                code: submission.sourceCode
            };
        }

        let starterCode = '';
        try {
            starterCode = await generateBoilerplateService.getOrGenerateBoilerplate(
                String(task._id),
                String(question._id),
                employeeId,
                resolvedLanguage,
                String(language._id)
            );
        } catch (error: any) {
            console.error(`Boilerplate generation failed: ${error?.message || error}`);
            starterCode = '';
        }

        /*
         * ---------------------------------------------------------
         * 13. Prepare Response
         * ---------------------------------------------------------
         */

        const data = {
            taskId: String(task._id),
            questionId: String(question._id),
            taskName: task.taskName || '',
            question: question.question || '',
            description: question.description || '',
            allowedLanguages,
            language: resolvedLanguage,
            languageId: String(language._id),
            starterCode,
            lastSubmittedCode
        };

        /*
         * ---------------------------------------------------------
         * 14. Return
         * ---------------------------------------------------------
         */

        return {
            success: true,
            data
        };

    } catch (error: any) {
        console.error(`Error in getQuestion service: ${error?.message || error}`);
       throw error;
    }
};

export default { getQuestion };
