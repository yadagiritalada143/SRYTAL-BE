import { Types } from 'mongoose';
import CourseTaskModel from '../../model/courseTaskModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseAssignment from '../../model/courseAssignmentModel';
import ProgrammingLanguages from '../../model/programmingLanguagesModel';
import CodeRunModel from '../../model/codeRunModel';
import { normalizeLanguage, isSupportedLanguage, resolveStarterCode, getFallbackLanguages } from '../../util/languageUtils';
import { resolveQuestion, toQuestionIdFilter } from '../../util/courseTaskQuestions';
import { ICourseTaskQuestion } from '../../interfaces/courseTask';
import generateBoilerplateService from './generateBoilerplateService';
import { ILastSubmittedCode, IGetQuestionResponse } from '../../interfaces/codingQuestion';

interface IQuestionContext {
    success: boolean;
    task?: any;
    /** The question of the task being opened. */
    resolvedQuestion?: ICourseTaskQuestion;
    /** Normalized question identity for the satellite collections (null = legacy). */
    resolvedQuestionId?: string | null;
    resolvedLanguage?: string;
    resolvedLanguageId?: string;
    availableLanguages?: string[];
    notFound?: boolean;
    notCodingQuestion?: boolean;
    notAssigned?: boolean;
    invalidLanguage?: boolean;
    questionNotFound?: boolean;
}

/**
 * Shared scope validation for "open coding question / fetch boilerplate": the
 * task must exist, be a coding question and belong to a course assigned to the
 * employee; the requested language must be supported. The task holds many
 * questions, so the one to open is resolved here too (falling back to the first
 * active question when the client does not name one). Also resolves the
 * canonical language key + the programming-language _id.
 */
const resolveQuestionContext = async (
    id: string,
    language: string,
    employeeId: string,
    languageId: string = '',
    questionId: string = ''
): Promise<IQuestionContext> => {
    // `id` is a question id, so the parent task is located through the embedded
    // questions. One-release compatibility: a task id is still accepted, because
    // clients built before the multi-question change send the task id in the path.
    let task: any = null;
    let idQuestionId = '';

    const trimmedId = String(id || '').trim();

    if (Types.ObjectId.isValid(trimmedId)) {
        task = await CourseTaskModel.findById(trimmedId).lean();
    }

    if (!task) {
        const wanted = toQuestionIdFilter(trimmedId);

        if (wanted) {
            task = await CourseTaskModel.findOne({ 'questions.questionId': wanted }).lean();

            if (task) {
                idQuestionId = wanted;
            }
        }
    }

    if (!task) {
        return { success: false, notFound: true };
    }

    if (!task.isCoding) {
        return { success: false, notCodingQuestion: true };
    }

    const question = resolveQuestion(task, questionId || idQuestionId);

    if (!question) {
        return { success: false, questionNotFound: true };
    }

    const resolvedQuestionId = toQuestionIdFilter(question.questionId);

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
        resolvedQuestion: question,
        resolvedQuestionId,
        resolvedLanguage,
        resolvedLanguageId,
        availableLanguages
    };
};

/**
 * Shared starter chain: 1. Writer-supplied starter (also the cache for
 * AI-generated skeletons).  2. AI-generated question + language skeleton.
 *  3. '' (empty editor) as the last resort.
 */
const resolveStarterChain = async (
    task: any,
    question: ICourseTaskQuestion,
    language: string,
    userId: string
): Promise<string> => {
    let starterCode = resolveStarterCode(question, language);
    if (!starterCode && language) {
        try {
            starterCode = await generateBoilerplateService.getOrGenerateBoilerplate(task, question, language, userId);
        } catch (error: any) {
            console.error(`AI starter resolution failed for '${language}': ${error.message}`);
            starterCode = '';
        }
    }
    return starterCode;
};

/**
 * Employee-facing "open a coding question": returns the task id, the question that
 * was opened, the available languages, the starter code for the requested (or
 * first) language and the employee's last submitted source in that language.
 * Resolution order for the editor body: last submitted code first, then the
 * starter. A task holds many questions, so the request may name one with
 * `taskQuestionId`; when it does not, the task's first active question is used.
 * Scoped by employee so a user can only read questions that belong to one of
 * their assigned courses. The available languages are read from the
 * programming-languages collection so the employee can pick the language at
 * run time; the hardcoded list is only used as a fallback when the collection
 * is empty.
 */
const getQuestion = async (
    id: string,
    language: string,
    employeeId: string,
    languageId: string = '',
    questionId: string = ''
): Promise<IGetQuestionResponse> => {
    const context = await resolveQuestionContext(id, language, employeeId, languageId, questionId);

    if (!context.success) {
        return context;
    }

    const task = context.task;
    const taskId = String(task._id);
    const question = context.resolvedQuestion as ICourseTaskQuestion;
    const resolvedQuestionId = context.resolvedQuestionId ?? null;
    const resolvedLanguage = context.resolvedLanguage || '';
    const resolvedLanguageId = context.resolvedLanguageId || '';
    const availableLanguages = context.availableLanguages || [];

    let lastSubmittedCode: ILastSubmittedCode | null = null;
    if (resolvedLanguageId) {
        const submission: any = await CodeRunModel.findOne({
            taskId,
            questionId: resolvedQuestionId,
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

    const starterCode = await resolveStarterChain(task, question, resolvedLanguage, employeeId);

    return {
        success: true,
        taskId,
        questionId: resolvedQuestionId,
        /** @deprecated Kept one release for clients still reading taskQuestionId. */
        taskQuestionId: resolvedQuestionId,
        taskName: task.taskName,
        question: question.question,
        description: question.description,
        allowedLanguages: availableLanguages,
        language: resolvedLanguage,
        languageId: resolvedLanguageId,
        starterCode,
        lastSubmittedCode
    };
};


export default { getQuestion };