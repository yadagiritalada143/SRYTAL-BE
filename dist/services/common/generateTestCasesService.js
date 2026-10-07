"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIN_TEST_CASE_COUNT = void 0;
const axios_1 = __importDefault(require("axios"));
const getUserOpenRouterKeyService_1 = __importDefault(require("../useropenrouter/getUserOpenRouterKeyService"));
const OPENROUTER_CHAT_COMPLETIONS_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_TESTS_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/auto';
const OPENROUTER_TIMEOUT_MS = 30000;
const DEFAULT_TEST_CASE_COUNT = 5;
exports.MIN_TEST_CASE_COUNT = 2;
/**
 * Parses the raw OpenRouter response content into an array of test cases.
 * Tolerates markdown fences / prose wrapping and a { testCases: [...] } shape.
 * Coerces numbers/booleans to strings (models often emit `true`, `5`, etc.).
 * Throws INVALID_GENERATED_TEST_CASES when nothing usable is found.
 */
const extractTestCases = (content) => {
    let parsed = null;
    let raw = (content || '').trim();
    // Strip markdown code fences if the model wrapped the JSON in them.
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced && fenced[1]) {
        raw = fenced[1].trim();
    }
    try {
        parsed = JSON.parse(raw);
    }
    catch (error) {
        const start = raw.indexOf('[');
        const end = raw.lastIndexOf(']');
        if (start !== -1 && end !== -1 && end > start) {
            try {
                parsed = JSON.parse(raw.slice(start, end + 1));
            }
            catch (e) {
                parsed = null;
            }
        }
    }
    if (parsed && !Array.isArray(parsed) && typeof parsed === 'object') {
        if (Array.isArray(parsed.testCases)) {
            parsed = parsed.testCases;
        }
        else {
            const wrapper = Object.values(parsed).find((value) => Array.isArray(value));
            if (wrapper) {
                parsed = wrapper;
            }
            else if (parsed.input !== undefined &&
                parsed.expectedOutput !== undefined) {
                // 'json_object' mode sometimes makes the model return a single
                // test-case object instead of an array.
                parsed = [parsed];
            }
        }
    }
    const source = Array.isArray(parsed) ? parsed : [];
    const seen = new Set();
    const testCases = source
        .filter((item) => item &&
        item.input !== undefined && item.input !== null &&
        item.expectedOutput !== undefined && item.expectedOutput !== null)
        .map((item, index) => ({
        name: item.name !== undefined && item.name !== null
            ? String(item.name)
            : `Test case ${index + 1}`,
        input: String(item.input),
        expectedOutput: String(item.expectedOutput),
        isSample: Boolean(item.isSample) || false
    }))
        .filter((testCase) => {
        const key = `${testCase.input}|${testCase.expectedOutput}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
    if (testCases.length === 0) {
        console.error(`Could not extract test cases from OpenRouter. Raw content: ${raw.slice(0, 2000)}`);
        throw new Error('INVALID_GENERATED_TEST_CASES');
    }
    return testCases;
};
/**
 * Reusable test-case generator. Sends the coding question and the selected
 * programming language to OpenRouter (using the authenticated employee's saved
 * OpenRouter key) and returns a validated, structured JSON test-case array.
 * The user's code is never sent to OpenRouter.
 */
const generateTestCases = async (userId, question, language) => {
    var _a, _b, _c, _d, _e, _f;
    const keyRecord = await getUserOpenRouterKeyService_1.default.getUserOpenRouterKeyService(userId);
    const openRouterKey = keyRecord === null || keyRecord === void 0 ? void 0 : keyRecord.openrouterKey;
    if (!openRouterKey) {
        throw new Error('OPENROUTER_KEY_NOT_FOUND');
    }
    const prompt = `You are a test-case generator for programming problems.

Generate test cases for the following coding question:

Question:
${question}

Selected programming language: ${language}

Requirements:
- Generate exactly ${DEFAULT_TEST_CASE_COUNT} DIFFERENT test cases.
- Include normal/common cases and appropriate edge cases (empty input, large values, negative numbers, boundary conditions, etc.).
- Each test case must have a unique "name".
- Response type is json_object: return a single JSON object containing a "testCases" array in the exact format below.
- Return ONLY the JSON object. Do not include markdown, code fences, or any explanation text.

Format:
{
  "testCases": [
    {
      "name": "test case name",
      "input": "input value",
      "expectedOutput": "expected output"
    }
  ]
}`;
    let response;
    try {
        response = await axios_1.default.post(OPENROUTER_CHAT_COMPLETIONS_URL, {
            model: OPENROUTER_TESTS_MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            response_format: { type: 'json_object' }
        }, {
            headers: {
                Authorization: `Bearer ${openRouterKey}`,
                'Content-Type': 'application/json'
            },
            timeout: OPENROUTER_TIMEOUT_MS
        });
    }
    catch (error) {
        const isTimeout = error.code === 'ECONNABORTED' ||
            ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 408 ||
            String(error.message).includes('timeout');
        if (isTimeout) {
            throw new Error('OPENROUTER_TEST_CASE_GENERATION_TIMEOUT');
        }
        const status = (_b = error.response) === null || _b === void 0 ? void 0 : _b.status;
        if (status === 401 || status === 403) {
            throw new Error('OPENROUTER_KEY_INVALID');
        }
        console.error(`OpenRouter test-case generation error: ${error.message}`);
        throw new Error('TEST_CASES_GENERATION_FAILED');
    }
    const content = (_f = (_e = (_d = (_c = response.data) === null || _c === void 0 ? void 0 : _c.choices) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.message) === null || _f === void 0 ? void 0 : _f.content;
    if (!content) {
        console.error('OpenRouter returned no content for test case generation.');
        throw new Error('INVALID_GENERATED_TEST_CASES');
    }
    return extractTestCases(content);
};
exports.default = { generateTestCases };
