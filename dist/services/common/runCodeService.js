"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const courseAssignmentModel_1 = __importDefault(require("../../model/courseAssignmentModel"));
const codingQuestionTestCaseModel_1 = __importDefault(require("../../model/codingQuestionTestCaseModel"));
const codeRunModel_1 = __importDefault(require("../../model/codeRunModel"));
const generateTestCasesService_1 = __importStar(require("./generateTestCasesService"));
const executeCodeService_1 = __importDefault(require("./executeCodeService"));
const evaluateTestCasesService_1 = __importDefault(require("./evaluateTestCasesService"));
const codeQualityAnalysisService_1 = __importDefault(require("./codeQualityAnalysisService"));
const languageUtils_1 = require("../../util/languageUtils");
const GENERATION_WAIT_ATTEMPTS = 12;
const GENERATION_WAIT_INTERVAL_MS = 250;
const TEST_CASE_EXECUTION_CONCURRENCY = 2;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/**
 * Runs `mapper` over `items` with at most `limit` promises in flight at once.
 * Used for the per-test-case execution loop because the public Wandbox API
 * queues concurrent requests; firing every test case at once makes them pile
 * up and occasionally trip the request timeout.
 */
const mapWithConcurrency = async (items, limit, mapper) => {
    const results = new Array(items.length);
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
const hasEnoughTestCases = (doc) => doc &&
    doc.status === 'COMPLETED' &&
    Array.isArray(doc.testCases) &&
    doc.testCases.length >= generateTestCasesService_1.MIN_TEST_CASE_COUNT;
const ensureTestCases = async (taskId, userId, question, language) => {
    let doc = await codingQuestionTestCaseModel_1.default.findOne({ taskId }).lean();
    if (hasEnoughTestCases(doc)) {
        return doc.testCases;
    }
    const waitForCompletion = async () => {
        for (let i = 0; i < GENERATION_WAIT_ATTEMPTS; i++) {
            await wait(GENERATION_WAIT_INTERVAL_MS);
            doc = await codingQuestionTestCaseModel_1.default.findOne({ taskId }).lean();
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
    let claim;
    try {
        claim = await codingQuestionTestCaseModel_1.default.findOneAndUpdate({
            taskId,
            $or: [
                { status: { $in: ['PENDING', 'FAILED'] } },
                { status: 'COMPLETED', $expr: { $lt: [{ $size: { $ifNull: ['$testCases', []] } }, generateTestCasesService_1.MIN_TEST_CASE_COUNT] } }
            ]
        }, { $set: { status: 'GENERATING', generatedBy: 'OpenRouter' } }, { new: true });
    }
    catch (error) {
        console.error(`Test case generation claim error: ${error.message}`);
    }
    if (claim) {
        if (hasEnoughTestCases(claim)) {
            return claim.testCases;
        }
    }
    else if (doc) {
        // Doc exists but is not claimable (another request is generating it).
        return waitForCompletion();
    }
    else {
        try {
            claim = await codingQuestionTestCaseModel_1.default.findOneAndUpdate({ taskId }, { $set: { status: 'GENERATING' }, $setOnInsert: { generatedBy: 'OpenRouter', testCases: [] } }, { new: true, upsert: true, setDefaultsOnInsert: true });
        }
        catch (error) {
            console.error(`Test case generation upsert error: ${error.message}`);
        }
        if (claim && hasEnoughTestCases(claim)) {
            return claim.testCases;
        }
    }
    try {
        const generated = await generateTestCasesService_1.default.generateTestCases(userId, question, language);
        await codingQuestionTestCaseModel_1.default.updateOne({ taskId }, { $set: { status: 'COMPLETED', testCases: generated, generatedAt: new Date() } });
        return generated;
    }
    catch (error) {
        await codingQuestionTestCaseModel_1.default.updateOne({ taskId }, { $set: { status: 'FAILED' } }).catch(() => undefined);
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
const runCode = async (questionId, language, code, employeeId, runType = 'run') => {
    const task = await courseTaskModel_1.default.findById(questionId).lean();
    if (!task) {
        return { success: false, notFound: true };
    }
    if (!task.isCoding) {
        return { success: false, notCodingQuestion: true };
    }
    const parentModule = await coursemoduleModel_1.default.findById(task.moduleId).lean();
    if (!(parentModule === null || parentModule === void 0 ? void 0 : parentModule.courseId)) {
        return { success: false, notFound: true };
    }
    const assignment = await courseAssignmentModel_1.default.findOne({ employeeId, courseId: parentModule.courseId }).lean();
    if (!assignment) {
        return { success: false, notAssigned: true };
    }
    if (!(0, languageUtils_1.isSupportedLanguage)(language)) {
        return { success: false, invalidLanguage: true };
    }
    const testCases = await ensureTestCases(String(task._id), employeeId, task.question || '', language);
    const results = await mapWithConcurrency(testCases, TEST_CASE_EXECUTION_CONCURRENCY, async (testCase) => {
        const execution = await executeCodeService_1.default.executeCode({
            language,
            code,
            input: testCase.input
        });
        return evaluateTestCasesService_1.default.evaluateTestCase(testCase, execution);
    });
    const { total, passed, failed, score } = evaluateTestCasesService_1.default.summarizeResults(results);
    // The Submit contract: a final submission is only accepted once every test
    // case passes. Trial runs (/runcode) are always allowed so the employee can
    // iterate on failures.
    if (runType === 'submit' && failed > 0) {
        return { success: false, notAllTestsPassed: true };
    }
    const overallStatus = failed === 0 ? 'ALL_PASSED' : 'SOME_FAILED';
    let aiEvaluation = null;
    try {
        aiEvaluation = await codeQualityAnalysisService_1.default.analyzeCodeQuality({
            userId: employeeId,
            question: task.question || '',
            language,
            code,
            results
        });
    }
    catch (error) {
        // Informational only: never fail the run because code-quality analysis failed.
        console.error(`Code-quality analysis skipped: ${error.message}`);
    }
    await codeRunModel_1.default.create({
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
    });
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
exports.default = { runCode };
