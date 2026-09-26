import { Types } from 'mongoose';
import CourseTaskModel from '../../model/courseTaskModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseAssignment from '../../model/courseAssignmentModel';
import CodingQuestionTestCaseModel from '../../model/codingQuestionTestCaseModel';
import CodeRunModel from '../../model/codeRunModel';
import ProgrammingLanguages from '../../model/programmingLanguagesModel';
import generateTestCasesService, { MIN_TEST_CASE_COUNT } from './generateTestCasesService';
import executeCodeService from './executeCodeService';
import evaluateTestCasesService from './evaluateTestCasesService';
import codeQualityAnalysisService from './codeQualityAnalysisService';
import getProgrammingLanguageByIdService from './getProgrammingLanguageByIdService';
import { normalizeLanguage } from '../../util/languageUtils';
import {
    IRunCodeResponse,
    ICodeRunTestCaseResult,
    IAiCodeQualityEvaluation,
    ILastCodeSubmission
} from '../../interfaces/codingQuestion';

const GENERATION_WAIT_ATTEMPTS = 12;
const GENERATION_WAIT_INTERVAL_MS = 250;
const TEST_CASE_EXECUTION_CONCURRENCY = 2;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs `mapper` over `items` with at most `limit` promises in flight at once.
 * Used for the per-test-case execution loop because the public Wandbox API
 * queues concurrent requests; firing every test case at once makes them pile
 * up and occasionally trip the request timeout.
 */
const mapWithConcurrency = async <T, R>(
    items: T[],
    limit: number,
    mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> => {
    const results: R[] = new Array(items.length);
    let cursor = 0;
    const workerCount = Math.min(limit, items.length);
    const workers = Array.from({ length: workerCount }, async () => {
        while (cursor < items.length) {
            const index = cursor++;
            results[index] = await mapper(items[index], index);
        }
    });
    await Promise.all(workers);
    return results;
};

/**
 * Returns the stored test cases for a coding question, generating them via
 * OpenRouter on the very first Run Code request and reusing them afterwards.
 * Uses the taskId as the coding-question identifier and a status-based claim so
 * concurrent first clicks cannot generate duplicate test-case sets.
 */
const hasEnoughTestCases = (doc: any): boolean =>
    doc &&
    doc.status === 'COMPLETED' &&
    Array.isArray(doc.testCases) &&
    doc.testCases.length >= MIN_TEST_CASE_COUNT;

const ensureTestCases = async (
    taskId: string,
    userId: string,
    question: string,
    language: string
): Promise<any[]> => {
    let doc: any = await CodingQuestionTestCaseModel.findOne({ taskId }).lean();

    if (hasEnoughTestCases(doc)) {
        return doc.testCases;
    }

    const waitForCompletion = async (): Promise<any[]> => {
        for (let i = 0; i < GENERATION_WAIT_ATTEMPTS; i++) {
            await wait(GENERATION_WAIT_INTERVAL_MS);
            doc = await CodingQuestionTestCaseModel.findOne({ taskId }).lean();
            if (hasEnoughTestCases(doc)) {
                return doc.testCases;
            }
        }
        throw new Error('TEST_CASES_GENERATION_IN_PROGRESS');
    };

    // Another request is already generating: wait briefly and reuse the result.
    if (doc && doc.status === 'GENERATING') {
        return waitForCompletion();
    }

    // Claim generation: either a fresh doc (PENDING/FAILED) or an existing doc
    // that only has an insufficient number of test cases (regenerate).
    let claim: any;
    try {
        claim = await CodingQuestionTestCaseModel.findOneAndUpdate(
            {
                taskId,
                $or: [
                    { status: { $in: ['PENDING', 'FAILED'] } },
                    { status: 'COMPLETED', $expr: { $lt: [{ $size: { $ifNull: ['$testCases', []] } }, MIN_TEST_CASE_COUNT] } }
                ]
            },
            { $set: { status: 'GENERATING', generatedBy: 'OpenRouter' } },
            { new: true }
        );
    } catch (error: any) {
        console.error(`Test case generation claim error: ${error.message}`);
    }

    if (claim) {
        if (hasEnoughTestCases(claim)) {
            return claim.testCases;
        }
    } else if (doc) {
        // Doc exists but is not claimable (another request is generating it).
        return waitForCompletion();
    } else {
        try {
            claim = await CodingQuestionTestCaseModel.findOneAndUpdate(
                { taskId },
                { $set: { status: 'GENERATING' }, $setOnInsert: { generatedBy: 'OpenRouter', testCases: [] } },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
        } catch (error: any) {
            console.error(`Test case generation upsert error: ${error.message}`);
        }
        if (claim && hasEnoughTestCases(claim)) {
            return claim.testCases;
        }
    }

    try {
        const generated = await generateTestCasesService.generateTestCases(userId, question, language);

        await CodingQuestionTestCaseModel.updateOne(
            { taskId },
            { $set: { status: 'COMPLETED', testCases: generated, generatedAt: new Date() } }
        );

        return generated;
    } catch (error: any) {
        await CodingQuestionTestCaseModel.updateOne(
            { taskId },
            { $set: { status: 'FAILED' } }
        ).catch(() => undefined);
        throw error;
    }
};

/**
 * The last code the employee ran or submitted, across every coding question -
 * not just the one being submitted now. Both record types live in the same
 * collection, so a single lookup sorted by `updatedAt` yields whichever was
 * touched most recently: `type: 'run'` snapshots (one per question, upserted
 * and re-stamped on every trial run) and `type: 'submit'` history. Sorting on
 * `updatedAt` rather than `createdAt` matters for runs, because re-running a
 * question bumps `updatedAt` while leaving the original `createdAt` intact.
 *
 * Read before the new submission is persisted so the value reported back is the
 * *previous* one. Returns null when the employee has never run anything.
 */
const getLastSubmission = async (employeeId: string): Promise<ILastCodeSubmission | null> => {
    const doc: any = await CodeRunModel.findOne(
        { userId: employeeId },
        {
            userId: 1,
            taskId: 1,
            languageId: 1,
            sourceCode: 1,
            passedCount: 1,
            failedCount: 1,
            score: 1,
            status: 1,
            type: 1,
            updatedAt: 1
        }
    )
        .sort({ updatedAt: -1 })
        .lean();

    if (!doc) {
        return null;
    }

    return {
        employeeId: String(doc.userId),
        questionId: String(doc.taskId),
        languageId: String(doc.languageId),
        code: doc.sourceCode,
        passedTestCases: doc.passedCount,
        failedTestCases: doc.failedCount,
        score: doc.score,
        status: doc.status,
        type: doc.type,
        submittedAt: doc.updatedAt
    };
};

/**
 * Resolves the `language` field the client sends on Run Code / Submit Code. It
 * may be a MongoDB programming-language id (the current contract) OR a language
 * name/alias (the employee UI still sends e.g. "Javascript"); both are accepted
 * so old and new clients keep working. Returns the programming-language document
 * or null when nothing matches.
 */
const resolveProgrammingLanguage = async (input: string): Promise<any | null> => {
    const trimmed = (input || '').trim();
    if (!trimmed) return null;

    if (Types.ObjectId.isValid(trimmed)) {
        const byId = await getProgrammingLanguageByIdService.getProgrammingLanguageById(trimmed);
        if (byId) {
            return byId;
        }
    }

    const wanted = normalizeLanguage(trimmed) || trimmed.toLowerCase();
    const languages: any[] = await ProgrammingLanguages.find({}).lean();
    return (
        languages.find((language) => {
            const name =
                normalizeLanguage(language?.languageName) ||
                String(language?.languageName || '').toLowerCase().trim();
            return name === wanted;
        }) || null
    );
};

/**
 * The shared grading engine behind both Run Code and Submit Code: validates
 * the request, resolves (or generates-and-stores) the coding-question test
 * cases, runs the employee's submitted code against every test-case input on
 * Wandbox, evaluates each result (compares expected vs actual output), computes
 * the score, gathers an informational OpenRouter code-quality evaluation
 * (never overriding the execution verdicts), persists the run
 * (`type: 'run'` for a trial run, `type: 'submit'` for a final submission)
 * and returns the combined result. Submissions additionally report the last
 * code the employee ran or submitted via `lastSubmission`.
 */
const runCode = async (
    questionId: string,
    languageId: string,
    code: string,
    employeeId: string,
    runType: 'run' | 'submit' = 'run'
): Promise<IRunCodeResponse> => {
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

    const programmingLanguage: any = await resolveProgrammingLanguage(languageId);

    if (!programmingLanguage) {
        return { success: false, invalidLanguage: true };
    }

    const resolvedLanguageId = String(programmingLanguage._id);

    const resolvedLanguage =
        typeof programmingLanguage.languageName === 'string'
            ? normalizeLanguage(programmingLanguage.languageName)
            : undefined;

    if (!resolvedLanguage) {
        return { success: false, invalidLanguage: true };
    }

    const testCases = await ensureTestCases(
        String(task._id),
        employeeId,
        task.question || '',
        resolvedLanguage
    );

    const results: ICodeRunTestCaseResult[] = await mapWithConcurrency(
        testCases,
        TEST_CASE_EXECUTION_CONCURRENCY,
        async (testCase: any) => {
            const execution = await executeCodeService.executeCode({
                language: resolvedLanguage,
                code,
                input: testCase.input
            });

            return evaluateTestCasesService.evaluateTestCase(testCase, execution);
        }
    );

    const { total, passed, failed, score } = evaluateTestCasesService.summarizeResults(results);

    // The Submit contract: a final submission is only accepted once every test
    // case passes. Trial runs (/runcode) are always allowed so the employee can
    // iterate on failures.
    if (runType === 'submit' && failed > 0) {
        return { success: false, notAllTestsPassed: true };
    }

    const overallStatus = failed === 0 ? 'ALL_PASSED' : 'SOME_FAILED';

    let aiEvaluation: IAiCodeQualityEvaluation | null = null;
    try {
        aiEvaluation = await codeQualityAnalysisService.analyzeCodeQuality({
            userId: employeeId,
            question: task.question || '',
            language: resolvedLanguage,
            code,
            results
        });
    } catch (error: any) {
        // Informational only: never fail the run because code-quality analysis failed.
        console.error(`Code-quality analysis skipped: ${error.message}`);
    }

    const executionRecord = {
        userId: employeeId,
        taskId: questionId,
        languageId: resolvedLanguageId,
        sourceCode: code,
        results,
        passedCount: passed,
        failedCount: failed,
        score,
        aiEvaluation,
        status: overallStatus
    };

    let lastSubmission: ILastCodeSubmission | null = null;

    if (runType === 'submit') {
        // Fetch the previous run/submission before inserting the new one, so the
        // employee gets their prior code back rather than the current one.
        try {
            lastSubmission = await getLastSubmission(employeeId);
        } catch (error: any) {
            // Supplementary context only: never fail a valid submission for it.
            console.error(`Last submission lookup skipped: ${error.message}`);
        }

        await CodeRunModel.create({
            ...executionRecord,
            type: 'submit'
        } as any);
    } else {
        await CodeRunModel.findOneAndUpdate(
            { userId: employeeId, taskId: questionId, type: 'run' },
            { $set: { ...executionRecord, type: 'run' } },
            { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );
    }

    return {
        success: true,
        lastSubmission,
        executionResult: {
            questionId,
            language: resolvedLanguage,
            languageId: resolvedLanguageId,
            totalTestCases: total,
            passedTestCases: passed,
            failedTestCases: failed,
            score,
            results,
            aiEvaluation
        }
    };
};

export default { runCode };
