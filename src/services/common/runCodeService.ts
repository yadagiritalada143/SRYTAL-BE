import { Types } from 'mongoose';

import CourseTaskModel from '../../model/courseTaskModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseAssignment from '../../model/courseAssignmentModel';
import CodingQuestionTestCaseModel from '../../model/codingQuestionTestCaseModel';
import CodeRunModel from '../../model/codeRunModel';
import ProgrammingLanguages from '../../model/programmingLanguagesModel';
import TaskCodingQuestionModel from '../../model/taskCodingQuestionModel';
import generateTestCasesService, { MIN_TEST_CASE_COUNT } from './generateTestCasesService';
import executeCodeService from './executeCodeService';
import evaluateTestCasesService from './evaluateTestCasesService';
import codeQualityAnalysisService from './codeQualityAnalysisService';
import getProgrammingLanguageByIdService from './getProgrammingLanguageByIdService';
import { normalizeLanguage, isExecutableLanguage } from '../../util/languageUtils';
import { toQuestionIdFilter, resolveQuestion } from '../../util/courseTaskQuestions';
import { syncTaskCompletionFromSubmissions } from '../../util/syncTaskCompletion';
import { ICourseTaskQuestion } from '../../interfaces/courseTask';

import { IRunCodeResponse, ICodeRunTestCaseResult, IAiCodeQualityEvaluation, ILastCodeSubmission } from '../../interfaces/codingQuestion';

const GENERATION_WAIT_ATTEMPTS = 12;
const GENERATION_WAIT_INTERVAL_MS = 250;
const TEST_CASE_EXECUTION_CONCURRENCY = 2;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const cleanSourceCode = (code: string): string => {
    if (typeof code !== 'string') {
        return '';
    }

    return code
        .replace(/^\s*```[a-zA-Z0-9_+#.-]*\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim();
};


const mapWithConcurrency = async <T, R>(
    items: T[],
    limit: number,
    mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> => {

    const results: R[] = new Array(items.length);

    let cursor = 0;

    const workerCount = Math.min(
        limit,
        items.length
    );

    const workers = Array.from(
        { length: workerCount },
        async () => {

            while (cursor < items.length) {

                const index = cursor++;

                results[index] = await mapper(
                    items[index],
                    index
                );
            }
        }
    );

    await Promise.all(workers);

    return results;
};


const hasEnoughTestCases = (doc: any): boolean =>
    Boolean(
        doc &&
        doc.status === 'COMPLETED' &&
        Array.isArray(doc.testCases) &&
        doc.testCases.length >= MIN_TEST_CASE_COUNT
    );


/**
 * Generate or reuse test cases.
 *
 * Test-case identity:
 * taskId + questionId
 *
 * OpenRouter receives:
 * userId + question + language
 */
const ensureTestCases = async (taskId: string, questionId: string | null, userId: string, question: string, language: string): Promise<any[]> => {

    if (!questionId) {
        throw new Error('QUESTION_ID_REQUIRED');
    }

    const identity = { taskId, questionId };

    let doc: any =
        await CodingQuestionTestCaseModel
            .findOne(identity)
            .lean();
    /**
     * Already generated.
     */
    if (hasEnoughTestCases(doc)) {
        return doc.testCases;
    }

    /**
     * Wait for another request that is already generating.
     */
    const waitForCompletion = async (): Promise<any[]> => {

        for (
            let attempt = 0;
            attempt < GENERATION_WAIT_ATTEMPTS;
            attempt++
        ) {

            await wait(
                GENERATION_WAIT_INTERVAL_MS
            );

            doc = await CodingQuestionTestCaseModel.findOne(identity).lean();

            if (hasEnoughTestCases(doc)) {
                return doc.testCases;
            }

            if (
                doc &&
                doc.status !== 'GENERATING'
            ) {
                break;
            }
        }

        throw new Error('TEST_CASES_GENERATION_IN_PROGRESS');
    };

    /**
     * Another request is generating.
     */
    if (doc?.status === 'GENERATING') {
        return waitForCompletion();
    }

    /**
     * Claim an existing document.
     *
     * This prevents multiple requests from generating
     * the same test cases simultaneously.
     */
    let claim: any =
        await CodingQuestionTestCaseModel.findOneAndUpdate(

            {
                ...identity,

                $or: [
                    {
                        status: {
                            $in: [
                                'PENDING',
                                'FAILED'
                            ]
                        }
                    },
                    {
                        status: 'COMPLETED',
                        $expr: {
                            $lt: [
                                {
                                    $size: {
                                        $ifNull: [
                                            '$testCases',
                                            []
                                        ]
                                    }
                                },
                                MIN_TEST_CASE_COUNT
                            ]
                        }
                    }
                ]
            },

            {
                $set: {
                    status: 'GENERATING',
                    generatedBy: 'OpenRouter'
                }
            },

            {
                new: true
            }
        );


    /**
     * If no document exists, create and claim it.
     */
    if (!claim && !doc) {

        claim =
            await CodingQuestionTestCaseModel.findOneAndUpdate(

                identity,

                {
                    $set: {
                        status: 'GENERATING',
                        generatedBy: 'OpenRouter'
                    },

                    $setOnInsert: {
                        testCases: []
                    }
                },

                {
                    new: true,
                    upsert: true,
                    setDefaultsOnInsert: true
                }
            );
    }


    /**
     * Another request won the generation race.
     */
    if (!claim) {
        return waitForCompletion();
    }


    /**
     * Another request may have completed it
     * between our first read and claim.
     */
    if (hasEnoughTestCases(claim)) {
        return claim.testCases;
    }

    /**
     * Generate test cases using the actual question
     * and resolved programming language.
     */
    try {

        const generated = await generateTestCasesService.generateTestCases(userId, taskId, questionId, question, language);
        if (!Array.isArray(generated) || generated.length < MIN_TEST_CASE_COUNT
        ) {
            throw new Error('INVALID_GENERATED_TEST_CASES');
        }
        await CodingQuestionTestCaseModel.updateOne(

            identity,

            {
                $set: {
                    status: 'COMPLETED',
                    testCases: generated,
                    generatedAt: new Date()
                }
            }
        );
        return generated;

    } catch (error: any) {
        await CodingQuestionTestCaseModel.updateOne(
            identity,

            {
                $set: {
                    status: 'FAILED'
                }
            }

        ).catch(() => undefined);

        throw error;
    }
};

/**
 * Resolve programming language.
 *
 * Supports:
 * 1. MongoDB languageId
 * 2. languageName
 * 3. canonicalKey
 */
const resolveProgrammingLanguage = async (input: string): Promise<any> => {
    const trimmed = (input || '').trim();

    if (!trimmed) {
        return null;
    }

    /**
     * Only send ObjectId-shaped values to findById. Language names such as
     * "JavaScript" are resolved through the language-name lookup below.
     */
    if (Types.ObjectId.isValid(trimmed)) {
        const byId =
            await getProgrammingLanguageByIdService
                .getProgrammingLanguageById(
                    trimmed
                );

        if (byId) {
            return byId;
        }
    }

    /**
     * Try language name / canonical key.
     */
    const wanted = normalizeLanguage(trimmed) || trimmed.toLowerCase();

    const languages = await ProgrammingLanguages.find({}).lean();

    return (
        languages.find((language) => {

            const name =
                normalizeLanguage(
                    language?.languageName
                ) ||
                String(
                    language?.languageName || ''
                )
                    .toLowerCase()
                    .trim();

            const canonicalKey =
                String(
                    language?.canonicalKey || ''
                )
                    .toLowerCase()
                    .trim();

            return (name === wanted || canonicalKey === wanted);

        }) || null
    );
};

/**
 * Get latest submission for:
 * employee + task + question + language
 */
const getLastSubmission = async (employeeId: string, taskId: string, questionId: string, languageId: string): Promise<ILastCodeSubmission | null> => {
    const doc: any =
        await CodeRunModel.findOne({ userId: employeeId, taskId, questionId, languageId, type: 'submit' }).sort({updatedAt: -1}).lean();
    if (!doc) {
        return null;
    }

    return {

        employeeId: String(doc.userId),
        taskId: String(doc.taskId),
        questionId: toQuestionIdFilter(doc.questionId),
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
 * Main Run Code / Submit Code engine.
 */
const runCode = async (taskId: string, questionId: string, languageId: string, code: string, employeeId: string, runType: 'run' | 'submit' = 'run'): Promise<IRunCodeResponse> => {

    const task = await CourseTaskModel.findById(taskId).lean();

    if (!task) {
        return { success: false, notFound: true };
    }

    /**
     * 3. Resolve selected question.
     */
    let question: ICourseTaskQuestion | null = null;

    const questionQuery = TaskCodingQuestionModel.findOne(
        questionId
            ? {
                _id: questionId,
                taskId: String(task._id),
                status: 'ACTIVE'
            }
            : {
                taskId: String(task._id),
                status: 'ACTIVE'
            }
    );

    if (!questionId) {
        questionQuery.sort({
            order: 1,
            _id: 1
        });
    }

    const storedQuestion = await questionQuery.lean();

    if (storedQuestion) {
        question = {
            questionId: String(storedQuestion._id),
            question: storedQuestion.question,
            description: storedQuestion.description,
            status: storedQuestion.status,
            order: storedQuestion.order,
            starterCode: []
        };
    }

    // Keep compatibility with tasks created before questions moved into their
    // own collection.
    if (!question) {
        question = resolveQuestion(
            task,
            questionId
        ) as ICourseTaskQuestion | null;
    }

    if (!question) {
        return { success: false, questionNotFound: true };
    }

    const resolvedQuestionId = toQuestionIdFilter(question.questionId);

    /**
     * 4. Find parent module.
     */
    const parentModule: any = await CourseModuleModel.findById(task.moduleId).lean();

    if (!parentModule?.courseId) {
        return { success: false, notFound: true };
    }

    /**
     * 5. Verify employee assignment.
     */
    const assignment =
        await CourseAssignment.findOne({ employeeId, courseId: parentModule.courseId }).lean();

    if (!assignment) {
        return { success: false, notAssigned: true };
    }


    /**
     * 6. Resolve programming language.
     */
    const programmingLanguage = await resolveProgrammingLanguage(languageId);

    if (!programmingLanguage) {
        return { success: false, invalidLanguage: true };
    }


    const resolvedLanguageId = String(programmingLanguage._id);


    const resolvedLanguage =
        (
            typeof programmingLanguage.canonicalKey ===
            'string' &&
            programmingLanguage.canonicalKey.trim()
        )
            ? programmingLanguage.canonicalKey.trim()
            : normalizeLanguage(
                programmingLanguage.languageName
            );


    /**
     * 7. Clean source code.
     */
    const cleanedCode = cleanSourceCode(code);

    if (!cleanedCode) {
        throw new Error('CODE_REQUIRED');
    }


    /**
     * Validate executable language.
     */
    if (
        !resolvedLanguage ||
        !isExecutableLanguage(
            resolvedLanguage
        )
    ) {

        return {
            success: false,
            invalidLanguage: true
        };
    }


    /**
     * 8. Generate/retrieve test cases.
     *
     * Test cases are generated from:
     *
     * question + programming language
     *
     * and stored using:
     *
     * taskId + questionId
     */
    const testCases = await ensureTestCases(String(task._id), resolvedQuestionId, employeeId, question.question || '', resolvedLanguage);

    if (!Array.isArray(testCases) || testCases.length === 0
    ) {
         throw new Error('INVALID_GENERATED_TEST_CASES');
    }

    /**
     * 9. Execute every test case.
     */
    const results: ICodeRunTestCaseResult[] = await mapWithConcurrency(testCases, TEST_CASE_EXECUTION_CONCURRENCY,
            async (testCase) => {
                try {
                    const execution = await executeCodeService.executeCode({ language: resolvedLanguage, code: cleanedCode, input: testCase.input });
                    return evaluateTestCasesService.evaluateTestCase(testCase, execution);

                } catch (error: any) {

                    if (error?.message === 'CODE_EXECUTION_TIMEOUT') {
                        throw error;
                    }
                    throw new Error('CODE_EXECUTION_FAILED');
                }
            }
        );
    /**
     * 10. Calculate result.
     */
    const { total, passed, failed, score } = evaluateTestCasesService.summarizeResults(results);

    /**
     * 11. Submit requires every test case to pass.
     */
    if (runType === 'submit' && failed > 0) {
        return {
            success: false,
            notAllTestsPassed: true,
            executionResult: {
                taskId,
                questionId: resolvedQuestionId,
                taskQuestionId: resolvedQuestionId,
                language: resolvedLanguage,
                languageId: resolvedLanguageId,
                totalTestCases: total,
                passedTestCases: passed,
                failedTestCases: failed,
                score,
                results,
                aiEvaluation: null
            }
        };
    }


    const overallStatus = failed === 0 ? 'ALL_PASSED' : 'SOME_FAILED';

    /**
     * 12. AI code-quality analysis.
     *
     * Only run during Submit.
     */
    let aiEvaluation: IAiCodeQualityEvaluation | null = null;

    if (runType === 'submit') {

        if (resolvedQuestionId === null) {
            throw new Error(`A question must be resolved before submitting code.`);
        }

        try {

            aiEvaluation =
                await codeQualityAnalysisService
                    .analyzeCodeQuality({

                        userId:
                            employeeId,

                        question:
                            question.question || '',

                        language:
                            resolvedLanguage,

                        code:
                            cleanedCode,

                        results
                    });

        } catch {
            aiEvaluation = null;
        }
    }


    /**
     * 13. Prepare execution DB record.
     */
    const executionRecord = {

        userId:
            employeeId,

        taskId,

        questionId:
            resolvedQuestionId,

        languageId:
            resolvedLanguageId,

        sourceCode:
            cleanedCode,

        results,

        passedCount:
            passed,

        failedCount:
            failed,

        score,

        aiEvaluation,

        status:
            overallStatus
    };


    let lastSubmission:
        ILastCodeSubmission | null = null;


    /**
     * 14. Submit.
     *
     * Every Submit creates a new history record.
     */
    if (runType === 'submit') {

        try {

            if (resolvedQuestionId !== null) {

                lastSubmission =
                    await getLastSubmission(

                        employeeId,

                        taskId,

                        resolvedQuestionId,

                        resolvedLanguageId
                    );
            }

        } catch {
            lastSubmission = null;
        }


        await CodeRunModel.create({

            ...executionRecord,

            type: 'submit'
        });


        await syncTaskCompletionFromSubmissions({

            task,

            moduleId:
                parentModule._id,

            assignment,

            employeeId
        });


    } else {

        /**
         * 15. Run / Re-Run.
         *
         * Maintains one latest Run record for:
         *
         * user + task + question + language
         */
        await CodeRunModel.findOneAndUpdate(

            {
                userId:
                    employeeId,

                taskId,

                questionId:
                    resolvedQuestionId,

                languageId:
                    resolvedLanguageId,

                type:
                    'run'
            },

            {
                $set: {

                    ...executionRecord,

                    type:
                        'run'
                }
            },

            {
                upsert:
                    true,

                new:
                    true,

                runValidators:
                    true,

                setDefaultsOnInsert:
                    true
            }
        );
    }


    /**
     * 16. Final response.
     */
    return {

        success:
            true,

        lastSubmission,

        executionResult: {

            taskId,

            questionId:
                resolvedQuestionId,

            taskQuestionId:
                resolvedQuestionId,

            language:
                resolvedLanguage,

            languageId:
                resolvedLanguageId,

            totalTestCases:
                total,

            passedTestCases:
                passed,

            failedTestCases:
                failed,

            score,

            results,

            aiEvaluation
        }
    };
};

export default {
    runCode
};
