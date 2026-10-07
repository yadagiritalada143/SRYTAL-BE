import axios from 'axios';
import getUserOpenRouterKeyService from '../useropenrouter/getUserOpenRouterKeyService';
import { ITestCase } from '../../interfaces/codingQuestionTestCase';

const OPENROUTER_CHAT_COMPLETIONS_URL =
    'https://openrouter.ai/api/v1/chat/completions';

const OPENROUTER_TESTS_MODEL =
    process.env.OPENROUTER_MODEL?.trim() || 'openrouter/auto';

const OPENROUTER_TIMEOUT_MS = 60000;

const OPENROUTER_MAX_TOKENS = 8000;

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
    const prompt = `Generate programming test cases strictly based on the coding question provided below.

IMPORTANT RULES:

1. Carefully read and understand the coding question before generating test cases.
2. Generate test cases ONLY based on the requirements, input format, constraints, and expected behavior explicitly mentioned in the coding question.
3. Do NOT invent additional requirements, restrictions, assumptions, or constraints that are not mentioned in the coding question.
4. Follow the exact input format specified in the coding question.
5. Follow the exact expected output format specified in the coding question.
6. Generate exactly 3 test cases.
7. Include normal/common cases and relevant edge cases when applicable.
8. Consider zero, negative values, positive values, boundary values, empty values, duplicate values, or other edge cases ONLY when they are valid for the given coding question.
9. If the coding question allows negative numbers, negative numbers MUST be treated as valid input.
10. NEVER reject negative values just because they are negative. Reject them ONLY when the coding question explicitly states that only positive numbers, non-negative numbers, or another restricted range is allowed.
11. Do NOT change the meaning or requirements of the coding question when creating test cases.
12. Every input must be valid according to the coding question.
13. Every expectedOutput must be the correct result for its corresponding input.
14. Do NOT generate duplicate test cases.
15. Keep each test case input and expectedOutput reasonably small.
16. Do NOT generate huge arrays, matrices, strings, or datasets.
17. Maximum 50 elements for arrays unless the coding question specifically requires more.
18. Keep strings reasonably short unless the coding question specifically requires a longer string.
19. Keep matrices reasonably small unless the coding question specifically requires a larger matrix.
20. Do NOT generate unnecessarily large numbers or outputs.
21. Test cases must be practical and suitable for actual code execution.
22. Do NOT include explanations, reasoning, comments, markdown, or any text outside the JSON response.
23. Return ONLY valid JSON.
24. Return exactly 3 objects inside the "testCases" array.

Return the response in exactly this format:

{
  "testCases": [
    {
      "testCaseName": "sample_1",
      "input": "...",
      "expectedOutput": "...",
      "isHidden": false
    },
    {
      "testCaseName": "sample_2",
      "input": "...",
      "expectedOutput": "...",
      "isHidden": true
    },
    {
      "testCaseName": "sample_3",
      "input": "...",
      "expectedOutput": "...",
      "isHidden": true
    }
  ]
}

CODING QUESTION:
${question}

PROGRAMMING LANGUAGE:
${language}
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
