import axios from 'axios';
import getUserOpenRouterKeyService from '../useropenrouter/getUserOpenRouterKeyService';
import { ITestCase } from '../../interfaces/codingQuestionTestCase';

const OPENROUTER_CHAT_COMPLETIONS_URL =
    'https://openrouter.ai/api/v1/chat/completions';

const OPENROUTER_TESTS_MODEL =
    process.env.OPENROUTER_MODEL?.trim() || 'openrouter/free';

const OPENROUTER_TIMEOUT_MS = 60000;

const OPENROUTER_MAX_TOKENS = 3000;

const DEFAULT_TEST_CASE_COUNT = 3;

export const MIN_TEST_CASE_COUNT = 2;

/**
 * Extracts generated test cases from OpenRouter response.
 *
 * Supported formats:
 * 1. { "testCases": [...] }
 * 2. [...]
 * 3. Single test-case object
 * 4. JSON wrapped inside markdown
 */
const extractTestCases = (
    content: string
): ITestCase[] => {
    let parsed: any = null;
    let raw = (content || '').trim();

    if (!raw) {
        throw new Error(
            'INVALID_GENERATED_TEST_CASES'
        );
    }

    /**
     * Remove markdown code fences.
     */
    const fenced = raw.match(
        /```(?:json)?\s*([\s\S]*?)```/i
    );

    if (fenced?.[1]) {
        raw = fenced[1].trim();
    }

    /**
     * Try parsing the complete response.
     */
    try {
        parsed = JSON.parse(raw);
    } catch {
        /**
         * Try extracting a JSON object.
         */
        const objectStart = raw.indexOf('{');
        const objectEnd = raw.lastIndexOf('}');

        if (
            objectStart !== -1 &&
            objectEnd !== -1 &&
            objectEnd > objectStart
        ) {
            try {
                parsed = JSON.parse(
                    raw.slice(
                        objectStart,
                        objectEnd + 1
                    )
                );
            } catch {
                parsed = null;
            }
        }

        /**
         * Try extracting a JSON array.
         */
        if (!parsed) {
            const arrayStart = raw.indexOf('[');
            const arrayEnd = raw.lastIndexOf(']');

            if (
                arrayStart !== -1 &&
                arrayEnd !== -1 &&
                arrayEnd > arrayStart
            ) {
                try {
                    parsed = JSON.parse(
                        raw.slice(
                            arrayStart,
                            arrayEnd + 1
                        )
                    );
                } catch {
                    parsed = null;
                }
            }
        }
    }

    /**
     * Handle object wrappers.
     */
    if (
        parsed &&
        !Array.isArray(parsed) &&
        typeof parsed === 'object'
    ) {
        if (Array.isArray(parsed.testCases)) {
            parsed = parsed.testCases;
        } else {
            /**
             * Find another array property if available.
             */
            const wrapper = Object.values(parsed).find(
                (value) => Array.isArray(value)
            );

            if (Array.isArray(wrapper)) {
                parsed = wrapper;
            } else if (
                parsed.input !== undefined &&
                parsed.expectedOutput !== undefined
            ) {
                parsed = [parsed];
            }
        }
    }

    const source = Array.isArray(parsed)
        ? parsed
        : [];

    const seen = new Set<string>();

    const testCases = source
        .filter(
            (item: any) =>
                item &&
                item.input !== undefined &&
                item.input !== null &&
                item.expectedOutput !== undefined &&
                item.expectedOutput !== null
        )
        .map(
            (
                item: any,
                index: number
            ): ITestCase => ({
                name:
                    item.name !== undefined &&
                    item.name !== null
                        ? String(item.name)
                        : `Test case ${index + 1}`,

                input: String(item.input),

                expectedOutput: String(
                    item.expectedOutput
                ),

                isSample: Boolean(
                    item.isSample
                ),
            })
        )
        .filter(
            (testCase: ITestCase) => {
                const key =
                    `${testCase.input}|${testCase.expectedOutput}`;

                if (seen.has(key)) {
                    return false;
                }

                seen.add(key);

                return true;
            }
        );

    if (
        testCases.length <
        MIN_TEST_CASE_COUNT
    ) {
        throw new Error(
            'INVALID_GENERATED_TEST_CASES'
        );
    }

    return testCases;
};

/**
 * Generates programming test cases using OpenRouter.
 *
 * userId
 *   ↓
 * user's OpenRouter API key
 *   ↓
 * question + language
 *   ↓
 * OpenRouter
 *   ↓
 * generated test cases
 */
const generateTestCases = async (
    userId: string,
    taskId: string,
    questionId: string,
    question: string,
    language: string
): Promise<ITestCase[]> => {
    /**
     * taskId and questionId are intentionally
     * accepted because the caller uses them to
     * identify and persist the generated test cases.
     *
     * They are NOT sent to OpenRouter.
     */
    void taskId;
    void questionId;

    /**
     * Get user's OpenRouter API key.
     */
    const keyRecord =
        await getUserOpenRouterKeyService
            .getUserOpenRouterKeyService(
                userId
            );

    const openRouterKey =
        keyRecord?.openrouterKey;

    if (!openRouterKey) {
        throw new Error(
            'OPENROUTER_KEY_NOT_FOUND'
        );
    }

    /**
     * Validate required data.
     */
    if (!question?.trim()) {
        throw new Error(
            'CODING_QUESTION_REQUIRED'
        );
    }

    if (!language?.trim()) {
        throw new Error(
            'PROGRAMMING_LANGUAGE_REQUIRED'
        );
    }

    /**
     * OpenRouter prompt.
     */
    const prompt = `
You are a test-case generator for programming problems.

Generate exactly ${DEFAULT_TEST_CASE_COUNT} test cases for the following coding question.

CODING QUESTION:
${question}

PROGRAMMING LANGUAGE:
${language}

REQUIREMENTS:
- Generate exactly ${DEFAULT_TEST_CASE_COUNT} different test cases.
- Include normal/common cases.
- Include appropriate edge cases.
- Consider empty input where applicable.
- Consider zero values where applicable.
- Consider negative values where applicable.
- Consider boundary values where applicable.
- Consider large values where applicable.
- Each test case must have a unique name.
- Do not generate duplicate test cases.
- The input must be valid for the coding question.
- The expectedOutput must be correct.
- Do not invent requirements that are not present in the question.

IMPORTANT:
- Return ONLY valid JSON.
- Do NOT return markdown.
- Do NOT return code fences.
- Do NOT return explanations.
- Do NOT return comments.
- Do NOT return any text before or after the JSON.

Return exactly:

{
  "testCases": [
    {
      "name": "test case name",
      "input": "input value",
      "expectedOutput": "expected output",
      "isSample": false
    }
  ]
}
`;

    let response: any;

    try {
        response = await axios.post(
            OPENROUTER_CHAT_COMPLETIONS_URL,
            {
                model:
                    OPENROUTER_TESTS_MODEL,

                messages: [
                    {
                        role: 'system',
                        content:
                            'Generate programming test cases and return only valid JSON.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],

                temperature: 0.1,

                max_tokens:
                    OPENROUTER_MAX_TOKENS,

                reasoning: {
                    effort: 'low',
                    exclude: true,
                },

                response_format: {
                    type: 'json_object',
                },
            },
            {
                headers: {
                    Authorization:
                        `Bearer ${openRouterKey}`,

                    'Content-Type':
                        'application/json',
                },

                timeout:
                    OPENROUTER_TIMEOUT_MS,
            }
        );
    } catch (error: any) {
        const status =
            error.response?.status;

        const isTimeout =
            error.code === 'ECONNABORTED' ||
            status === 408 ||
            String(error.message)
                .toLowerCase()
                .includes('timeout');

        if (isTimeout) {
            throw new Error(
                'OPENROUTER_TEST_CASE_GENERATION_TIMEOUT'
            );
        }

        if (
            status === 401 ||
            status === 403
        ) {
            throw new Error(
                'OPENROUTER_KEY_INVALID'
            );
        }

        if (status === 402) {
            throw new Error(
                'OPENROUTER_ACCOUNT_LIMIT'
            );
        }

        if (status === 429) {
            throw new Error(
                'OPENROUTER_RATE_LIMIT'
            );
        }

        if (
            status &&
            status >= 500
        ) {
            throw new Error(
                'OPENROUTER_SERVICE_UNAVAILABLE'
            );
        }

        throw new Error(
            'TEST_CASES_GENERATION_FAILED'
        );
    }

    /**
     * Get OpenRouter choice.
     */
    const choice =
        response.data?.choices?.[0];

    const finishReason =
        choice?.finish_reason;

    /**
     * Model stopped because token limit
     * was reached before returning content.
     */
    if (
        finishReason === 'length'
    ) {
        throw new Error(
            'OPENROUTER_TEST_OUTPUT_LIMIT'
        );
    }

    const content =
        choice?.message?.content;

    if (!content) {
        throw new Error(
            'INVALID_GENERATED_TEST_CASES'
        );
    }

    /**
     * Parse and validate generated test cases.
     */
    return extractTestCases(
        content
    );
};

export default {
    generateTestCases,
};
