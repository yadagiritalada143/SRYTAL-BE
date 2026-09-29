import CourseTaskModel from '../../model/courseTaskModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseAssignment from '../../model/courseAssignmentModel';
import ProgrammingLanguages from '../../model/programmingLanguagesModel';
import CodeRunModel from '../../model/codeRunModel';
import { normalizeLanguage, isSupportedLanguage, resolveStarterCode, getFallbackLanguages } from '../../util/languageUtils';
import generateBoilerplateService from './generateBoilerplateService';
import { ILastSubmittedCode, IGetQuestionResponse } from '../../interfaces/codingQuestion';

interface IQuestionContext {
    success: boolean;
    task?: any;
    resolvedLanguage?: string;
    resolvedLanguageId?: string;
    availableLanguages?: string[];
    notFound?: boolean;
    notCodingQuestion?: boolean;
    notAssigned?: boolean;
    invalidLanguage?: boolean;
}

/**
 * Shared scope validation for "open coding question / fetch boilerplate": the
 * task must exist, be a coding question and belong to a course assigned to the
 * employee; the requested language must be supported.
 * Also resolves the canonical language key + the programming-language _id.
 */
const resolveQuestionContext = async (
    questionId: string,
    language: string,
    employeeId: string,
    languageId: string = ''
): Promise<IQuestionContext> => {
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

    // The client may send either a programming-language Mongo _id (`languageId`)
    // or a friendly name / canonical key (`language`). A 24-hex id is resolved
    // to its canonical key first so the rest of the flow stays unchanged.
    let languageRef = language;
    if (/^[0-9a-fA-F]{24}$/.test(languageId.trim())) {
        const idDoc: any = await ProgrammingLanguages.findById(languageId.trim())
            .select('_id canonicalKey languageName isActive')
            .lean();
        if (!idDoc || !(idDoc.isActive !== false)) {
            return { success: false, invalidLanguage: true };
        }
        languageRef = (idDoc.canonicalKey || '').trim() ||
            normalizeLanguage(idDoc.languageName || '') ||
            '';
        if (!languageRef) {
            return { success: false, invalidLanguage: true };
        }
    }

    if (languageRef) {
        if (!isSupportedLanguage(languageRef)) {
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

    const resolvedLanguage = normalizeLanguage(languageRef) ||
        normalizeLanguage(availableLanguages[0] || '') ||
        availableLanguages[0] ||
        '';

    const resolvedLanguageId = languageIdByCanonical[resolvedLanguage] || '';

    return {
        success: true,
        task,
        resolvedLanguage,
        resolvedLanguageId,
        availableLanguages
    };
};

/**
 * Shared starter chain: 1. Writer-supplied starter (also the cache for
 * AI-generated skeletons). 2. AI-generated question + language skeleton.
 * 3. '' (empty editor) as the last resort.
 */
const resolveStarterChain = async (
    task: any,
    language: string,
    userId: string
): Promise<string> => {
    let starterCode = resolveStarterCode(task, language);
    if (!starterCode && language) {
        try {
            starterCode = await generateBoilerplateService.getOrGenerateBoilerplate(task, language, userId);
        } catch (error: any) {
            console.error(`AI starter resolution failed for '${language}': ${error.message}`);
            starterCode = '';
        }
    }
    return starterCode;
};

/**
 * Employee-facing "open a coding question": returns the question id, the
 * available languages, the starter code for the requested (or first) language
 * and the employee's last submitted source in that language. Resolution order
 * for the editor body: last submitted code first, then the starter. When the
 * employee has already submitted a final answer in that language, its source is
 * returned as `lastSubmittedCode` so the editor can restore it. Scoped by
 * employee so a user can only read questions that belong to one of their
 * assigned courses. The available languages are read from the
 * programming-languages collection so the employee can pick the language at
 * run time; the hardcoded list is only used as a fallback when the collection
 * is empty.
 */
const getQuestion = async (
    questionId: string,
    language: string,
    employeeId: string,
    languageId: string = ''
): Promise<IGetQuestionResponse> => {
    const context = await resolveQuestionContext(questionId, language, employeeId, languageId);

    if (!context.success) {
        return context;
    }

    const task = context.task;
    const resolvedLanguage = context.resolvedLanguage || '';
    const resolvedLanguageId = context.resolvedLanguageId || '';
    const availableLanguages = context.availableLanguages || [];

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

    const starterCode = await resolveStarterChain(task, resolvedLanguage, employeeId);

    return {
        success: true,
        questionId: String(task._id),
        allowedLanguages: availableLanguages,
        language: resolvedLanguage,
        languageId: resolvedLanguageId,
        starterCode,
        lastSubmittedCode
    };
};

export default { getQuestion };