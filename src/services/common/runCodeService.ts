import CourseTaskModel from '../../model/courseTaskModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseAssignment from '../../model/courseAssignmentModel';
import CodingQuestionTestCaseModel from '../../model/codingQuestionTestCaseModel';
import CodeRunModel from '../../model/codeRunModel';
import generateTestCasesService, { MIN_TEST_CASE_COUNT } from './generateTestCasesService';
import executeCodeService from './executeCodeService';
import evaluateTestCasesService from './evaluateTestCasesService';
import codeQualityAnalysisService from './codeQualityAnalysisService';
import { isSupportedLanguage } from '../../util/languageUtils';
import {
    IRunCodeResponse,
    ICodeRunTestCaseResult,
    IAiCodeQualityEvaluation
} from '../../interfaces/codingQuestion';

const GENERATION_WAIT_ATTEMPTS = 12;
const GENERATION_WAIT_INTERVAL_MS = 250;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
 * The shared grading engine behind both Run Code and Submit Code: validates
 * the request, resolves (or generates-and-stores) the coding-question test
 * cases, runs the employee's submitted code against every test-case input on
 * Piston, evaluates each result (compares expected vs actual output), computes
 * the score, gathers an informational OpenRouter code-quality evaluation
 * (never overriding the execution verdicts), persists the run
 * (`type: 'run'` for a trial run, `type: 'submit'` for a final submission)
 * and returns the combined result.
 */
const runCode = async (
    questionId: string,
    language: string,
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

    if (!isSupportedLanguage(language)) {
        return { success: false, invalidLanguage: true };
    }

    const testCases = await ensureTestCases(
        String(task._id),
        employeeId,
        task.question || '',
        language
    );

    const results: ICodeRunTestCaseResult[] = await Promise.all(
        testCases.map(async (testCase: any) => {
            const execution = await executeCodeService.executeCode({
                language,
                code,
                input: testCase.input
            });

            return evaluateTestCasesService.evaluateTestCase(testCase, execution);
        })
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
            language,
            code,
            results
        });
    } catch (error: any) {
        // Informational only: never fail the run because code-quality analysis failed.
        console.error(`Code-quality analysis skipped: ${error.message}`);
    }

    await CodeRunModel.create({
        userId: employeeId,
        taskId: questionId,
        language,
        sourceCode: code,
        results,
        passedCount: passed,
        failedCount: failed,
        score,
        aiEvaluation,
        status: overallStatus,
        type: runType
    } as any);

    return {
        success: true,
        executionResult: {
            questionId,
            language,
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