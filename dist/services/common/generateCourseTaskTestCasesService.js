"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
const mongoose_1 = require("mongoose");
const courseAssignmentModel_1 = __importDefault(require("../../model/courseAssignmentModel"));
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const codingTaskTestCaseModel_1 = __importDefault(require("../../model/codingTaskTestCaseModel"));
const getUserOpenRouterKeyService_1 = __importDefault(require("../useropenrouter/getUserOpenRouterKeyService"));
const OPENROUTER_CHAT_COMPLETIONS_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_TIMEOUT_MS = 30000;
const MIN_TEST_CASES = 3;
const MAX_TEST_CASES = 5;
const OPENROUTER_MAX_TOKENS = 60000;
const STALE_GENERATION_LOCK_MS = 2 * 60 * 1000;
const TEST_CASE_CATEGORIES = [
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
const CATEGORY_ALIASES = {
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
/**
 * Extract the first complete JSON object from model response.
 */
const extractJsonObject = (content) => {
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
            }
            else if (character === '\\') {
                escaped = true;
            }
            else if (character === '"') {
                inString = false;
            }
            continue;
        }
        if (character === '"') {
            inString = true;
        }
        else if (character === '{') {
            depth += 1;
        }
        else if (character === '}') {
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
const normalizeCategory = (category) => {
    if (typeof category !== 'string') {
        return 'basic';
    }
    const normalized = category
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-');
    return (CATEGORY_ALIASES[normalized] ||
        (TEST_CASE_CATEGORIES.includes(normalized)
            ? normalized
            : 'basic'));
};
/**
 * Parse and validate generated test cases.
 */
const parseGeneratedTestCases = (content, minimumCount = MIN_TEST_CASES) => {
    let candidate = content.trim();
    const fenced = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced === null || fenced === void 0 ? void 0 : fenced[1]) {
        candidate = fenced[1].trim();
    }
    let parsed;
    try {
        parsed = JSON.parse(extractJsonObject(candidate));
    }
    catch (_a) {
        throw new Error('INVALID_GENERATED_TEST_CASES');
    }
    if (!parsed ||
        typeof parsed !== 'object' ||
        !('testCases' in parsed) ||
        Object.keys(parsed).length !== 1 ||
        !Array.isArray(parsed.testCases)) {
        throw new Error('INVALID_GENERATED_TEST_CASES');
    }
    const rawCases = parsed.testCases;
    if (rawCases.length < minimumCount ||
        rawCases.length > MAX_TEST_CASES) {
        throw new Error('INVALID_GENERATED_TEST_CASES');
    }
    const testCases = rawCases.map((item, index) => {
        if (!item || typeof item !== 'object') {
            throw new Error('INVALID_GENERATED_TEST_CASES');
        }
        const testCase = item;
        const expectedId = `TC${String(index + 1).padStart(3, '0')}`;
        if (!['name', 'input', 'expectedOutput'].every((key) => Object.prototype.hasOwnProperty.call(testCase, key)) ||
            typeof testCase.name !== 'string' ||
            !testCase.name.trim() ||
            testCase.name.trim().length > 120 ||
            !(typeof testCase.input === 'string' ||
                typeof testCase.input === 'number') ||
            !(typeof testCase.expectedOutput === 'string' ||
                typeof testCase.expectedOutput === 'number')) {
            throw new Error('INVALID_GENERATED_TEST_CASES');
        }
        const input = String(testCase.input);
        const expectedOutput = String(testCase.expectedOutput);
        if (!expectedOutput.trim() ||
            input.length > 10000 ||
            expectedOutput.length > 10000) {
            throw new Error('INVALID_GENERATED_TEST_CASES');
        }
        return {
            id: expectedId,
            name: testCase.name.trim(),
            input,
            expectedOutput,
            category: normalizeCategory(testCase.category)
        };
    });
    /**
     * Remove duplicate input/output combinations.
     */
    const uniqueTestCases = [];
    const names = new Set();
    const inputOutputPairs = new Set();
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
        uniqueTestCases.push(Object.assign(Object.assign({}, testCase), { name }));
    }
    if (uniqueTestCases.length < minimumCount) {
        throw new Error('INVALID_GENERATED_TEST_CASES');
    }
    /**
     * Backend owns test-case IDs.
     * Never trust IDs generated by the AI model.
     */
    return uniqueTestCases.map((testCase, index) => (Object.assign(Object.assign({}, testCase), { id: `TC${String(index + 1).padStart(3, '0')}` })));
};
/**
 * Generate test cases using the user's stored OpenRouter API key.
 */
const requestGeneratedTestCases = async (taskName, taskDescription, userId) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const keyRecord = await getUserOpenRouterKeyService_1.default.getUserOpenRouterKeyService(userId);
    const apiKey = (_a = keyRecord === null || keyRecord === void 0 ? void 0 : keyRecord.openrouterKey) === null || _a === void 0 ? void 0 : _a.trim();
    if (!apiKey || /[\r\n]/.test(apiKey)) {
        throw new Error('OPENROUTER_KEY_INVALID');
    }
    const model = ((_b = process.env.OPENROUTER_MODEL) === null || _b === void 0 ? void 0 : _b.trim()) ||
        'openrouter/auto';
    let response;
    try {
        response = await axios_1.default.post(OPENROUTER_CHAT_COMPLETIONS_URL, {
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
                        'CODING TASK NAME:',
                        taskName.trim(),
                        '',
                        'CODING TASK DESCRIPTION (includes any examples and constraints):',
                        taskDescription.trim()
                    ].join('\n')
                }
            ],
            temperature: 0.2,
            response_format: {
                type: 'json_object'
            },
            max_tokens: OPENROUTER_MAX_TOKENS
        }, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: OPENROUTER_TIMEOUT_MS
        });
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            const status = (_c = error.response) === null || _c === void 0 ? void 0 : _c.status;
            if (status === 401 || status === 403) {
                throw new Error('OPENROUTER_KEY_INVALID');
            }
            if (status === 402) {
                throw new Error('OPENROUTER_ACCOUNT_LIMIT');
            }
            if (error.code === 'ECONNABORTED' ||
                status === 408) {
                throw new Error('OPENROUTER_TEST_CASE_GENERATION_TIMEOUT');
            }
            console.error('OpenRouter test-case request failed:', {
                status,
                code: error.code,
                responseData: (_d = error.response) === null || _d === void 0 ? void 0 : _d.data
            });
        }
        else {
            console.error('OpenRouter test-case request failed:', error instanceof Error
                ? error.message
                : 'UnknownError');
        }
        throw new Error('TEST_CASES_GENERATION_FAILED');
    }
    const choice = (_f = (_e = response.data) === null || _e === void 0 ? void 0 : _e.choices) === null || _f === void 0 ? void 0 : _f[0];
    const content = (_g = choice === null || choice === void 0 ? void 0 : choice.message) === null || _g === void 0 ? void 0 : _g.content;
    const generatedText = typeof content === 'string'
        ? content
        : Array.isArray(content)
            ? content
                .filter((block) => Boolean(block &&
                typeof block ===
                    'object' &&
                'text' in block &&
                typeof block.text ===
                    'string'))
                .map((block) => block.text)
                .join('\n')
            : '';
    const finishReason = (choice === null || choice === void 0 ? void 0 : choice.finish_reason) || null;
    /**
     * Important:
     * Never store a response that was truncated.
     */
    if (!generatedText.trim() ||
        finishReason === 'length') {
        console.warn('OpenRouter test-case response was empty or truncated.', {
            model: ((_h = response.data) === null || _h === void 0 ? void 0 : _h.model) || model,
            finishReason,
            contentLength: generatedText.length,
            usage: ((_j = response.data) === null || _j === void 0 ? void 0 : _j.usage) || null
        });
        throw new Error('INVALID_GENERATED_TEST_CASES');
    }
    try {
        return parseGeneratedTestCases(generatedText);
    }
    catch (error) {
        console.warn('OpenRouter test-case response failed schema validation.', {
            model: ((_k = response.data) === null || _k === void 0 ? void 0 : _k.model) || model,
            finishReason,
            contentLength: generatedText.length,
            usage: ((_l = response.data) === null || _l === void 0 ? void 0 : _l.usage) || null,
            responsePreview: generatedText.slice(0, 1000)
        });
        throw error;
    }
};
/**
 * Generate, persist and reuse coding-task test cases.
 *
 * IMPORTANT:
 * - A COMPLETED set for the SAME task description is reused without another
 *   OpenRouter request.
 * - forceRegenerate, or a changed task description, triggers regeneration.
 * - Student source-code changes do not cause test-case regeneration.
 */
const generateCourseTaskTestCases = async (taskId, userId, forceRegenerate = false) => {
    if (!mongoose_1.Types.ObjectId.isValid(taskId)) {
        throw new Error('INVALID_TASK_ID');
    }
    if (!userId ||
        !mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new Error('USER_AUTHENTICATION_REQUIRED');
    }
    const task = await courseTaskModel_1.default.findById(taskId).lean();
    if (!task) {
        throw new Error('COURSE_TASK_NOT_FOUND');
    }
    if (String(task.type || '').toUpperCase() !==
        'CODE') {
        throw new Error('NOT_CODING_TASK');
    }
    const taskName = String(task.taskName || '').trim();
    const taskDescription = String(task.taskDescription || '').trim();
    if (!taskName) {
        throw new Error('CODING_TASK_NAME_REQUIRED');
    }
    if (!taskDescription) {
        throw new Error('CODING_TASK_DESCRIPTION_REQUIRED');
    }
    const taskDescriptionHash = (0, crypto_1.createHash)('sha256')
        .update(taskDescription)
        .digest('hex');
    const parentModule = await coursemoduleModel_1.default.findById(task.moduleId)
        .select('courseId')
        .lean();
    if (!(parentModule === null || parentModule === void 0 ? void 0 : parentModule.courseId)) {
        throw new Error('TASK_NOT_ASSIGNED');
    }
    const assignment = await courseAssignmentModel_1.default.findOne({
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
     * A COMPLETED set is reused only when it is still valid and was generated
     * for the exact same task description. forceRegenerate always bypasses
     * reuse so an authorized caller can request fresh cases.
     */
    let existing = await codingTaskTestCaseModel_1.default.findOne({
        taskId
    }).lean();
    if ((existing === null || existing === void 0 ? void 0 : existing.status) === 'COMPLETED' && !forceRegenerate) {
        const storedCases = Array.isArray(existing.testCases)
            ? existing.testCases
            : [];
        let storedCasesAreValid = false;
        try {
            parseGeneratedTestCases(JSON.stringify({
                testCases: storedCases
            }), MIN_TEST_CASES);
            storedCasesAreValid = storedCases.length <= MAX_TEST_CASES;
        }
        catch (_a) {
            storedCasesAreValid = false;
        }
        if (storedCasesAreValid &&
            existing.taskDescriptionHash === taskDescriptionHash) {
            return {
                taskId,
                generated: false,
                reused: true,
                testCaseCount: storedCases.length,
                generatedAt: existing.generatedAt || null
            };
        }
    }
    /**
     * If another request is currently generating,
     * do not start another generation.
     */
    if ((existing === null || existing === void 0 ? void 0 : existing.status) === 'GENERATING') {
        const lockIsStale = existing.updatedAt instanceof Date &&
            Date.now() -
                existing.updatedAt.getTime() >
                STALE_GENERATION_LOCK_MS;
        if (!lockIsStale) {
            throw new Error('TEST_CASES_GENERATION_IN_PROGRESS');
        }
    }
    /**
     * Create or claim the generation lock.
     */
    if (!existing) {
        try {
            await codingTaskTestCaseModel_1.default.create({
                taskId,
                taskDescriptionHash,
                status: 'GENERATING',
                testCases: [],
                generatedBy: 'OpenRouter'
            });
        }
        catch (error) {
            if (error &&
                typeof error === 'object' &&
                'code' in error &&
                error.code === 11000) {
                throw new Error('TEST_CASES_GENERATION_IN_PROGRESS');
            }
            throw error;
        }
    }
    else {
        const statusFilter = existing.status === 'GENERATING'
            ? {
                status: 'GENERATING',
                updatedAt: {
                    $lt: new Date(Date.now() -
                        STALE_GENERATION_LOCK_MS)
                }
            }
            : {
                status: existing.status
            };
        const claimed = await codingTaskTestCaseModel_1.default.findOneAndUpdate(Object.assign({ _id: existing._id, taskId }, statusFilter), {
            $set: {
                status: 'GENERATING',
                taskDescriptionHash
            }
        }, {
            new: true
        }).lean();
        if (!claimed) {
            throw new Error('TEST_CASES_GENERATION_IN_PROGRESS');
        }
        existing = claimed;
    }
    try {
        /**
         * Generate fresh test cases only after the generation lock has been
         * claimed and no reusable completed set was found.
         */
        const testCases = await requestGeneratedTestCases(taskName, taskDescription, userId);
        const generatedAt = new Date();
        await codingTaskTestCaseModel_1.default.updateOne({
            taskId,
            taskDescriptionHash,
            status: 'GENERATING'
        }, {
            $set: {
                status: 'COMPLETED',
                taskDescriptionHash,
                testCases,
                generatedBy: 'OpenRouter',
                generatedAt
            }
        });
        return {
            taskId,
            generated: true,
            reused: false,
            testCaseCount: testCases.length,
            generatedAt
        };
    }
    catch (error) {
        /**
         * Generation failed.
         *
         * No invalid/partial test cases are stored.
         * The next Run Code can retry because there is
         * still no valid completed test suite.
         */
        await codingTaskTestCaseModel_1.default.updateOne({
            taskId,
            taskDescriptionHash,
            status: 'GENERATING'
        }, {
            $set: {
                status: 'FAILED'
            }
        });
        throw error;
    }
};
exports.default = {
    generateCourseTaskTestCases,
    parseGeneratedTestCases
};
