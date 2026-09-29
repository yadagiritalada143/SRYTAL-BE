import CourseTaskModel from '../../model/courseTaskModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseAssignment from '../../model/courseAssignmentModel';
import ProgrammingLanguages from '../../model/programmingLanguagesModel';
import CodeRunModel from '../../model/codeRunModel';
import { normalizeLanguage, isSupportedLanguage, resolveStarterCode, getFallbackLanguages } from '../../util/languageUtils';
import executeCodeService from './executeCodeService';
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

    // Only active languages are offered to employees (the seed marks
    // non-executable Wandbox labels such as CPP/OpenSSL inactive). `$ne: false`
    // keeps legacy docs that predate the isActive field working.
    const languageDocs: any[] = await ProgrammingLanguages.find({ isActive: { $ne: false } })
        .select('_id languageName canonicalKey')
        .sort({ displayOrder: 1 })
        .lean();
    const languageIdByCanonical: Record<string, string> = {};
    const collectionLanguages: string[] = [];
    for (const languageDoc of languageDocs || []) {
        const name = (languageDoc?.languageName || '').trim();
        if (!name) {
            continue;
        }
        collectionLanguages.push(name);
        const canonicalKey = (languageDoc?.canonicalKey || '').trim();
        const canonical = canonicalKey || normalizeLanguage(name) || name.toLowerCase();
        languageIdByCanonical[canonical] = String(languageDoc._id);
    }

    const fallbackLanguages = getFallbackLanguages();

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

    // Priority chain: writer-supplied starter, then Wandbox's own hello-world
    // template (see getWandboxStarter), then hardcoded last-resort boilerplate
    // (see HARDCODED_STARTER_CODE), then '' (empty editor).
    let starterCode = resolveStarterCode(task, resolvedLanguage);
    if (!starterCode) {
        try {
            starterCode = await executeCodeService.getWandboxStarter(resolvedLanguage);
        } catch (error: any) {
            console.error(`Dynamic starter resolution failed for '${resolvedLanguage}': ${error.message}`);
            starterCode = '';
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
            starterCode,
            lastSubmittedCode
        }
    };
};

export default { getCodingQuestion };
