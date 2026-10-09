import axios from 'axios';
import { Types } from 'mongoose';
import CourseAssignment from '../../model/courseAssignmentModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseTaskModel from '../../model/courseTaskModel';
import CodingTaskTestCaseModel from '../../model/codingTaskTestCaseModel';
import {
    CodingTaskTestCaseCategory,
    ICodingTaskTestCase
} from '../../interfaces/codingTaskTestCase';
import getUserOpenRouterKeyService from '../useropenrouter/getUserOpenRouterKeyService';

const OPENROUTER_CHAT_COMPLETIONS_URL =
    'https://openrouter.ai/api/v1/chat/completions';

const OPENROUTER_TIMEOUT_MS = 30000;

const MIN_TEST_CASES = 3;
const MAX_TEST_CASES = 6;

const OPENROUTER_MAX_TOKENS = 10000;

const STALE_GENERATION_LOCK_MS = 2 * 60 * 1000;

const TEST_CASE_CATEGORIES: CodingTaskTestCaseCategory[] = [
    'basic',
    'edge',
    'boundary',
    'minimum',
    'maximum',
    'single-element',
    'empty',
    'duplicate',
    'negative',
    'large',
    'special',
    'incorrect-solution'
];

const CATEGORY_ALIASES: Record<string, CodingTaskTestCaseCategory> = {
    basic: 'basic',
    normal: 'basic',
    'basic-case': 'basic',
    'normal-case': 'basic',

    edge: 'edge',
    'edge-case': 'edge',

    boundary: 'boundary',
    'boundary-case': 'boundary',

    minimum: 'minimum',
    min: 'minimum',

    maximum: 'maximum',
    max: 'maximum',

    'single-element': 'single-element',
    'single-item': 'single-element',

    empty: 'empty',

    duplicate: 'duplicate',
    duplicates: 'duplicate',

    negative: 'negative',

    large: 'large',

    special: 'special',

    'incorrect-solution': 'incorrect-solution',
    'common-mistake': 'incorrect-solution'
};

export interface IGenerateCourseTaskTestCasesResult {
    taskId: string;
    generated: boolean;
    reused: boolean;
    testCaseCount: number;
    generatedAt: Date | null;
}

/**
 * Extract the first complete JSON object from model response.
 */
const extractJsonObject = (content: string): string => {
    const start = content.indexOf('{');

    if (start < 0) {
        throw new Error('INVALID_GENERATED_TEST_CASES');
    }

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = start; index < content.length; index += 1) {
        const character = content[index];

        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (character === '\\') {
                escaped = true;
            } else if (character === '"') {
                inString = false;
            }

            continue;
        }

        if (character === '"') {
            inString = true;
        } else if (character === '{') {
            depth += 1;
        } else if (character === '}') {
            depth -= 1;

            if (depth === 0) {
                return content.slice(start, index + 1);
            }
        }
    }

    throw new Error('INVALID_GENERATED_TEST_CASES');
};

/**
 * Normalize test-case category.
 */
const normalizeCategory = (
    category: unknown
): CodingTaskTestCaseCategory => {
    if (typeof category !== 'string') {
        return 'basic';
    }

    const normalized = category
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-');

    return (
        CATEGORY_ALIASES[normalized] ||
        (TEST_CASE_CATEGORIES.includes(
            normalized as CodingTaskTestCaseCategory
        )
            ? (normalized as CodingTaskTestCaseCategory)
            : 'basic')
    );
};

/**
 * Parse and validate generated test cases.
 */
const parseGeneratedTestCases = (
    content: string,
    minimumCount = MIN_TEST_CASES
): ICodingTaskTestCase[] => {
    let candidate = content.trim();

    const fenced = candidate.match(
        /```(?:json)?\s*([\s\S]*?)```/i
    );

    if (fenced?.[1]) {
        candidate = fenced[1].trim();
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(extractJsonObject(candidate));
    } catch {
        throw new Error('INVALID_GENERATED_TEST_CASES');
    }

    if (
        !parsed ||
        typeof parsed !== 'object' ||
        !('testCases' in parsed) ||
        Object.keys(parsed).length !== 1 ||
        !Array.isArray(parsed.testCases)
    ) {
        throw new Error('INVALID_GENERATED_TEST_CASES');
    }

    const rawCases: unknown[] = parsed.testCases;

    if (
        rawCases.length < minimumCount ||
        rawCases.length > MAX_TEST_CASES
    ) {
        throw new Error('INVALID_GENERATED_TEST_CASES');
    }

    const testCases = rawCases.map(
        (item, index): ICodingTaskTestCase => {
            if (!item || typeof item !== 'object') {
                throw new Error('INVALID_GENERATED_TEST_CASES');
            }

            const testCase = item as Record<string, unknown>;

            const expectedId = `TC${String(index + 1).padStart(
                3,
                '0'
            )}`;

            if (
                !['name', 'input', 'expectedOutput'].every(
                    (key) =>
                        Object.prototype.hasOwnProperty.call(
                            testCase,
                            key
                        )
                ) ||
                typeof testCase.name !== 'string' ||
                !testCase.name.trim() ||
                testCase.name.trim().length > 120 ||
                !(
                    typeof testCase.input === 'string' ||
                    typeof testCase.input === 'number'
                ) ||
                !(
                    typeof testCase.expectedOutput === 'string' ||
                    typeof testCase.expectedOutput === 'number'
                )
            ) {
                throw new Error('INVALID_GENERATED_TEST_CASES');
            }

            const input = String(testCase.input);
            const expectedOutput = String(
                testCase.expectedOutput
            );

            if (
                input.length > 10000 ||
                expectedOutput.length > 10000
            ) {
                throw new Error('INVALID_GENERATED_TEST_CASES');
            }

            return {
                id: expectedId,
                name: testCase.name.trim(),
                input,
                expectedOutput,
                category: normalizeCategory(
                    testCase.category
                )
            };
        }
    );

    /**
     * Remove duplicate input/output combinations.
     */
    const uniqueTestCases: ICodingTaskTestCase[] = [];

    const names = new Set<string>();
    const inputOutputPairs = new Set<string>();

    for (const testCase of testCases) {
        const pair = JSON.stringify([
            testCase.input,
            testCase.expectedOutput
        ]);

        if (inputOutputPairs.has(pair)) {
            continue;
        }

        let name = testCase.name;
        let suffix = 2;

        while (names.has(name.toLowerCase())) {
            name = `${testCase.name} (${suffix})`;
            suffix += 1;
        }

        names.add(name.toLowerCase());
        inputOutputPairs.add(pair);

        uniqueTestCases.push({
            ...testCase,
            name
        });
    }

    if (uniqueTestCases.length < minimumCount) {
        throw new Error('INVALID_GENERATED_TEST_CASES');
    }

    /**
     * Backend owns test-case IDs.
     * Never trust IDs generated by the AI model.
     */
    return uniqueTestCases.map((testCase, index) => ({
        ...testCase,
        id: `TC${String(index + 1).padStart(3, '0')}`
    }));
};

/**
 * Generate test cases using the user's stored OpenRouter API key.
 */
const requestGeneratedTestCases = async (
    taskDescription: string,
    userId: string
): Promise<ICodingTaskTestCase[]> => {
    const keyRecord =
        await getUserOpenRouterKeyService.getUserOpenRouterKeyService(
            userId
        );

    const apiKey = keyRecord?.openrouterKey?.trim();

    if (!apiKey || /[\r\n]/.test(apiKey)) {
        throw new Error('OPENROUTER_KEY_INVALID');
    }

    const model =
        process.env.OPENROUTER_MODEL?.trim() ||
        'openrouter/auto';

    let response;

    try {
        response = await axios.post(
            OPENROUTER_CHAT_COMPLETIONS_URL,
            {
                model,

                messages: [
                    {
                        role: 'system',
                        content: [
                            'You generate high-quality test cases for programming problems.',
                            'Use ONLY the supplied coding-task statement as the source of requirements.',
                            'Do not invent requirements.',
                            'Do not assume unspecified behavior.',
                            'Expected outputs must follow exactly from the task requirements.',
                            'Return ONLY valid JSON.',
                            'Do not return Markdown.',
                            'Do not return explanations.',
                            'Do not return comments.'
                        ].join(' ')
                    },
                    {
                        role: 'user',
                        content: [
                            `Generate exactly ${MIN_TEST_CASES} to ${MAX_TEST_CASES} distinct test cases for this coding task.`,

                            'Cover applicable basic, edge, boundary, minimum, maximum, single-element, empty, duplicate, negative, large, and special inputs.',

                            'Include cases that can expose common incorrect solutions when the task requirements make those distinctions testable.',

                            'Only use categories that actually apply to the task.',

                            'Do not generate test cases that are unsupported by the task statement.',

                            'Input and expectedOutput must be exact strings in the task input/output format.',

                            'An empty string is valid only when the task format explicitly allows empty input or output.',

                            'Each test case must contain ONLY these fields:',
                            'name, input, expectedOutput, category.',

                            'Do NOT generate an id field. The backend will generate test-case IDs.',

                            'Use one of these categories when applicable:',
                            'basic, edge, boundary, minimum, maximum, single-element, empty, duplicate, negative, large, special, incorrect-solution.',

                            'Return exactly this JSON structure:',
                            '{"testCases":[{"name":"Basic case","input":"exact input","expectedOutput":"exact expected output","category":"basic"}]}',

                            'Do not add any additional top-level fields.',

                            '',
                            'CODING TASK:',
                            taskDescription.trim()
                        ].join('\n')
                    }
                ],

                temperature: 0.2,

                response_format: {
                    type: 'json_object'
                },

                max_tokens: OPENROUTER_MAX_TOKENS
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: OPENROUTER_TIMEOUT_MS
            }
        );
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;

            if (status === 401 || status === 403) {
                throw new Error('OPENROUTER_KEY_INVALID');
            }

            if (status === 402) {
                throw new Error('OPENROUTER_ACCOUNT_LIMIT');
            }

            if (
                error.code === 'ECONNABORTED' ||
                status === 408
            ) {
                throw new Error(
                    'OPENROUTER_TEST_CASE_GENERATION_TIMEOUT'
                );
            }

            console.error(
                'OpenRouter test-case request failed:',
                {
                    status,
                    code: error.code,
                    responseData: error.response?.data
                }
            );
        } else {
            console.error(
                'OpenRouter test-case request failed:',
                error instanceof Error
                    ? error.message
                    : 'UnknownError'
            );
        }

        throw new Error('TEST_CASES_GENERATION_FAILED');
    }

    const choice = response.data?.choices?.[0];

    const content = choice?.message?.content;

    const generatedText =
        typeof content === 'string'
            ? content
            : Array.isArray(content)
                ? content
                    .filter(
                        (
                            block
                        ): block is { text: string } =>
                            Boolean(
                                block &&
                                typeof block ===
                                    'object' &&
                                'text' in block &&
                                typeof block.text ===
                                    'string'
                            )
                    )
                    .map((block) => block.text)
                    .join('\n')
                : '';

    const finishReason =
        choice?.finish_reason || null;

    /**
     * Important:
     * Never store a response that was truncated.
     */
    if (
        !generatedText.trim() ||
        finishReason === 'length'
    ) {
        console.warn(
            'OpenRouter test-case response was empty or truncated.',
            {
                model: response.data?.model || model,
                finishReason,
                contentLength: generatedText.length,
                usage: response.data?.usage || null
            }
        );

        throw new Error(
            'INVALID_GENERATED_TEST_CASES'
        );
    }

    try {
        return parseGeneratedTestCases(
            generatedText
        );
    } catch (error: unknown) {
        console.warn(
            'OpenRouter test-case response failed schema validation.',
            {
                model: response.data?.model || model,
                finishReason,
                contentLength: generatedText.length,
                usage: response.data?.usage || null,
                responsePreview:
                    generatedText.slice(0, 1000)
            }
        );

        throw error;
    }
};

/**
 * Generate test cases ONLY when no completed test cases exist.
 *
 * IMPORTANT:
 * - No forceRegenerate.
 * - Once COMPLETED, always reuse the same test cases.
 * - Student code changes do not cause test-case regeneration.
 */
const generateCourseTaskTestCases = async (
    taskId: string,
    userId: string
): Promise<IGenerateCourseTaskTestCasesResult> => {
    if (!Types.ObjectId.isValid(taskId)) {
        throw new Error('INVALID_TASK_ID');
    }

    if (
        !userId ||
        !Types.ObjectId.isValid(userId)
    ) {
        throw new Error(
            'USER_AUTHENTICATION_REQUIRED'
        );
    }

    const task =
        await CourseTaskModel.findById(taskId).lean();

    if (!task) {
        throw new Error('COURSE_TASK_NOT_FOUND');
    }

    if (
        String(task.type || '').toUpperCase() !==
        'CODE'
    ) {
        throw new Error('NOT_CODING_TASK');
    }

    const taskDescription =
        String(task.taskDescription || '').trim();

    if (!taskDescription) {
        throw new Error(
            'CODING_TASK_DESCRIPTION_REQUIRED'
        );
    }

    const parentModule =
        await CourseModuleModel.findById(task.moduleId)
            .select('courseId')
            .lean();

    if (!parentModule?.courseId) {
        throw new Error('TASK_NOT_ASSIGNED');
    }

    const assignment =
        await CourseAssignment.findOne({
            employeeId: userId,
            courseId: parentModule.courseId
        })
            .select('_id')
            .lean();

    if (!assignment) {
        throw new Error('TASK_NOT_ASSIGNED');
    }

    /**
     * Check whether test cases already exist.
     *
     * If they are COMPLETED, ALWAYS reuse them.
     * There is intentionally NO forceRegenerate option.
     */
    let existing =
        await CodingTaskTestCaseModel.findOne({
            taskId
        }).lean();

    if (existing?.status === 'COMPLETED') {
        const storedCases = Array.isArray(
            existing.testCases
        )
            ? existing.testCases
            : [];

        if (
            storedCases.length < MIN_TEST_CASES ||
            storedCases.length > MAX_TEST_CASES
        ) {
            throw new Error(
                'STORED_TEST_CASES_INVALID'
            );
        }

        try {
            parseGeneratedTestCases(
                JSON.stringify({
                    testCases: storedCases
                }),
                MIN_TEST_CASES
            );
        } catch {
            throw new Error(
                'STORED_TEST_CASES_INVALID'
            );
        }

        return {
            taskId,
            generated: false,
            reused: true,
            testCaseCount: storedCases.length,
            generatedAt:
                existing.generatedAt || null
        };
    }

    /**
     * If another request is currently generating,
     * do not start another generation.
     */
    if (existing?.status === 'GENERATING') {
        const lockIsStale =
            existing.updatedAt instanceof Date &&
            Date.now() -
                existing.updatedAt.getTime() >
                STALE_GENERATION_LOCK_MS;

        if (!lockIsStale) {
            throw new Error(
                'TEST_CASES_GENERATION_IN_PROGRESS'
            );
        }
    }

    /**
     * Create or claim the generation lock.
     */
    if (!existing) {
        try {
            await CodingTaskTestCaseModel.create({
                taskId,
                status: 'GENERATING',
                testCases: [],
                generatedBy: 'OpenRouter'
            });
        } catch (error: unknown) {
            if (
                error &&
                typeof error === 'object' &&
                'code' in error &&
                error.code === 11000
            ) {
                throw new Error(
                    'TEST_CASES_GENERATION_IN_PROGRESS'
                );
            }

            throw error;
        }
    } else {
        const statusFilter =
            existing.status === 'GENERATING'
                ? {
                      status: 'GENERATING',
                      updatedAt: {
                          $lt: new Date(
                              Date.now() -
                                  STALE_GENERATION_LOCK_MS
                          )
                      }
                  }
                : {
                      status: existing.status
                  };

        const claimed =
            await CodingTaskTestCaseModel.findOneAndUpdate(
                {
                    _id: existing._id,
                    ...statusFilter
                },
                {
                    $set: {
                        status: 'GENERATING'
                    }
                },
                {
                    new: true
                }
            ).lean();

        if (!claimed) {
            throw new Error(
                'TEST_CASES_GENERATION_IN_PROGRESS'
            );
        }

        existing = claimed;
    }

    try {
        /**
         * Generate test cases ONLY because no completed
         * test suite currently exists.
         */
        const testCases =
            await requestGeneratedTestCases(
                taskDescription,
                userId
            );

        const generatedAt = new Date();

        await CodingTaskTestCaseModel.updateOne(
            {
                taskId,
                status: 'GENERATING'
            },
            {
                $set: {
                    status: 'COMPLETED',
                    testCases,
                    generatedBy: 'OpenRouter',
                    generatedAt
                }
            }
        );

        return {
            taskId,
            generated: true,
            reused: false,
            testCaseCount: testCases.length,
            generatedAt
        };
    } catch (error: unknown) {
        /**
         * Generation failed.
         *
         * No invalid/partial test cases are stored.
         * The next Run Code can retry because there is
         * still no valid completed test suite.
         */
        await CodingTaskTestCaseModel.updateOne(
            {
                taskId,
                status: 'GENERATING'
            },
            {
                $set: {
                    status: 'FAILED'
                }
            }
        );

        throw error;
    }
};

export default {
    generateCourseTaskTestCases,
    parseGeneratedTestCases
};
