import CourseTaskModel from '../../model/courseTaskModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseAssignment from '../../model/courseAssignmentModel';
import ProgrammingLanguages from '../../model/programmingLanguagesModel';
import CodeRunModel from '../../model/codeRunModel';
import { normalizeLanguage, isSupportedLanguage, resolveStarterCode } from '../../util/languageUtils';
import { LANGUAGE_MAP } from '../../types/languageExecutionMap';
import { IFetchCodingQuestionResponse, ILastSubmittedCode } from '../../interfaces/codingQuestion';

/**
 * Employee-facing "open a coding question": returns the problem statement, the
 * available languages and the starter code for the requested (or first) language.
 * When the employee has already submitted a final answer in that language, its
 * source code is returned as `lastSubmittedCode` so the editor can restore it
 * instead of the starter. Scoped by employee so a user can only read questions
 * that belong to one of their assigned courses. The available languages are read
 * from the programming-languages collection so the employee can pick the language
 * at run time; the hardcoded list is only used as a fallback when the collection
 * is empty.
 */
const getCodingQuestion = async (
    questionId: string,
    language: string,
    employeeId: string
): Promise<IFetchCodingQuestionResponse> => {
    const task: any = await CourseTaskModel.findById(questionId).lean();

    if (!task) {
        return { success: false, notFound: true };
    }

    if (!task.isCoding) {
        return { success: false, notCodingQuestion: true };
    }

    const parentModule: any = await CourseModuleModel.findById(task.moduleId).lean();

    if (!parentModule?.courseId) {
        return { success: false, notFound: true };
    }

    const assignment: any = await CourseAssignment.findOne({ employeeId, courseId: parentModule.courseId }).lean();

    if (!assignment) {
        return { success: false, notAssigned: true };
    }

    if (language) {
        if (!isSupportedLanguage(language)) {
            return { success: false, invalidLanguage: true };
        }
    }

    const languageDocs: any[] = await ProgrammingLanguages.find({}).select('_id languageName').lean();
    const languageIdByCanonical: Record<string, string> = {};
    const collectionLanguages: string[] = [];
    for (const languageDoc of languageDocs || []) {
        const name = (languageDoc?.languageName || '').trim();
        if (!name) {
            continue;
        }
        collectionLanguages.push(name);
        const canonical = normalizeLanguage(name) || name.toLowerCase();
        languageIdByCanonical[canonical] = String(languageDoc._id);
    }

    const fallbackLanguages = [...new Set(Object.values(LANGUAGE_MAP))]
        .map((language) => language.charAt(0).toUpperCase() + language.slice(1));

    const availableLanguages = collectionLanguages.length > 0 ? collectionLanguages : fallbackLanguages;

    const resolvedLanguage = normalizeLanguage(language) ||
        normalizeLanguage(availableLanguages[0] || '') ||
        availableLanguages[0] ||
        '';

    const resolvedLanguageId = languageIdByCanonical[resolvedLanguage] || '';

    let lastSubmittedCode: ILastSubmittedCode | null = null;
    if (resolvedLanguageId) {
        const submission: any = await CodeRunModel.findOne({
            taskId: questionId,
            userId: employeeId,
            type: 'submit',
            languageId: resolvedLanguageId
        }).sort({ updatedAt: -1 }).lean();
        if (submission && typeof submission.sourceCode === 'string' && submission.sourceCode.length > 0) {
            lastSubmittedCode = {
                language: resolvedLanguage,
                code: submission.sourceCode
            };
        }
    }

    return {
        success: true,
        question: {
            questionId: String(task._id),
            question: task.question || '',
            allowedLanguages: availableLanguages,
            language: resolvedLanguage,
            languageId: resolvedLanguageId,
            starterCode: resolveStarterCode(task, resolvedLanguage),
            lastSubmittedCode
        }
    };
};

export default { getCodingQuestion };
