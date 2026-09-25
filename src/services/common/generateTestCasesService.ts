import axios from 'axios';
import getUserOpenRouterKeyService from '../useropenrouter/getUserOpenRouterKeyService';
import { ITestCase } from '../../interfaces/codingQuestionTestCase';

const OPENROUTER_CHAT_COMPLETIONS_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_TESTS_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/auto';
const OPENROUTER_TIMEOUT_MS = 30000;
const DEFAULT_TEST_CASE_COUNT = 5;
export const MIN_TEST_CASE_COUNT = 2;

/**
 * Parses the raw OpenRouter response content into an array of test cases.
 * Tolerates markdown fences / prose wrapping and a { testCases: [...] } shape.
 * Coerces numbers/booleans to strings (models often emit `true`, `5`, etc.).
 * Throws INVALID_GENERATED_TEST_CASES when nothing usable is found.
 */
const extractTestCases = (content: string): ITestCase[] => {
    let parsed: any = null;
    let raw = (content || '').trim();

    // Strip markdown code fences if the model wrapped the JSON in them.
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced && fenced[1]) {
        raw = fenced[1].trim();
    }

    try {
        parsed = JSON.parse(raw);
    } catch (error) {
        const start = raw.indexOf('[');
        const end = raw.lastIndexOf(']');
        if (start !== -1 && end !== -1 && end > start) {
            try {
                parsed = JSON.parse(raw.slice(start, end + 1));
            } catch (e) {
                parsed = null;
            }
        }
    }

    if (parsed && !Array.isArray(parsed) && typeof parsed === 'object') {
        if (Array.isArray(parsed.testCases)) {
            parsed = parsed.testCases;
        } else {
            const wrapper = Object.values(parsed).find((value) => Array.isArray(value));
            if (wrapper) {
                parsed = wrapper;
            } else if (
                parsed.input !== undefined &&
                parsed.expectedOutput !== undefined
            ) {
                // 'json_object' mode sometimes makes the model return a single
                // test-case object instead of an array.
                parsed = [parsed];
            }
        }
    }

    const source = Array.isArray(parsed) ? parsed : [];

    const seen = new Set<string>();

    const testCases = source
        .filter((item: any) =>
            item &&
            item.input !== undefined && item.input !== null &&
            item.expectedOutput !== undefined && item.expectedOutput !== null
        )
        .map((item: any, index: number) => ({
            name:
                item.name !== undefined && item.name !== null
                    ? String(item.name)
                    : `Test case ${index + 1}`,
            input: String(item.input),
            expectedOutput: String(item.expectedOutput),
            isSample: Boolean(item.isSample) || false
        }))
        .filter((testCase: ITestCase) => {
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
const generateTestCases = async (
    userId: string,
    question: string,
    language: string
): Promise<ITestCase[]> => {
    const keyRecord = await getUserOpenRouterKeyService.getUserOpenRouterKeyService(userId);
    const openRouterKey = keyRecord?.openrouterKey;

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

    let response: any;
    try {
        response = await axios.post(
            OPENROUTER_CHAT_COMPLETIONS_URL,
            {
                model: OPENROUTER_TESTS_MODEL,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2,
                response_format: { type: 'json_object' }
            },
            {
                headers: {
                    Authorization: `Bearer ${openRouterKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: OPENROUTER_TIMEOUT_MS
            }
        );
    } catch (error: any) {
        const isTimeout =
            error.code === 'ECONNABORTED' ||
            error.response?.status === 408 ||
            String(error.message).includes('timeout');

        if (isTimeout) {
            throw new Error('OPENROUTER_TEST_CASE_GENERATION_TIMEOUT');
        }

        const status = error.response?.status;
        if (status === 401 || status === 403) {
            throw new Error('OPENROUTER_KEY_INVALID');
        }

        console.error(`OpenRouter test-case generation error: ${error.message}`);
        throw new Error('TEST_CASES_GENERATION_FAILED');
    }

    const content = response.data?.choices?.[0]?.message?.content;

    if (!content) {
        console.error('OpenRouter returned no content for test case generation.');
        throw new Error('INVALID_GENERATED_TEST_CASES');
    }

    return extractTestCases(content);
};

export default { generateTestCases };