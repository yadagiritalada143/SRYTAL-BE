import axios from 'axios';
import { Types } from 'mongoose';
import TaskCodingQuestionModel from '../../model/taskCodingQuestionModel';
import getUserOpenRouterKeyService from '../useropenrouter/getUserOpenRouterKeyService';
import { LANGUAGE_REGISTRY } from '../../types/languageExecutionMap';

const OPENROUTER_CHAT_COMPLETIONS_URL =
    'https://openrouter.ai/api/v1/chat/completions';

const OPENROUTER_MODEL =
    process.env.OPENROUTER_MODEL?.trim() || 'openrouter/auto';

const OPENROUTER_BOILERPLATE_TIMEOUT_MS = 60000;
const OPENROUTER_BOILERPLATE_MAX_TOKENS = 1500;

const inFlightGenerations: Record<string, Promise<string> | undefined> = {};

/**
 * Checks whether the generated response looks like actual source code.
 */
const looksLikeStarterCode = (code: string): boolean => {
    const value = code.trim();

    if (!value) {
        return false;
    }

    // Reject OpenRouter safety/moderation responses
    if (/user\s+safety\s*:/i.test(value)) {
        return false;
    }

    if (/^\s*\{\s*["']?(user\s+safety|safety)["']?\s*:/i.test(value)) {
        return false;
    }

    // Reject obvious AI explanations
    const invalidPatterns = [
        /^here\s+is/i,
        /^here's/i,
        /^sure[,!]/i,
        /^the\s+following/i,
        /^this\s+code/i,
        /^explanation\s*:/i,
    ];

    if (invalidPatterns.some((pattern) => pattern.test(value))) {
        return false;
    }

    // Basic programming-language constructs
    const codePatterns = [
        /\bfunction\b/,
        /\bconst\b/,
        /\blet\b/,
        /\bvar\b/,
        /\bclass\b/,
        /\bpublic\s+class\b/,
        /\bprivate\b/,
        /\bpublic\b/,
        /\bstatic\b/,
        /\bvoid\b/,
        /\bmain\s*\(/,
        /#include\b/,
        /import\s+/,
        /using\s+namespace\b/,
        /package\s+/,
        /def\s+\w+\s*\(/,
        /func\s+\w+\s*\(/,
        /fn\s+\w+\s*\(/,
        /=>/,
    ];

    return codePatterns.some((pattern) => pattern.test(value));
};

/**
 * Removes markdown fences and extracts code from JSON responses.
 */
const extractBoilerplateCode = (
    rawContent: string,
    canonicalKey: string = ''
): string => {
    if (!rawContent?.trim()) {
        throw new Error('BOILERPLATE_EMPTY_RESPONSE');
    }

    let content = rawContent.trim();

    // Remove markdown code fences
    content = content
        .replace(/^```[\w+#.-]*\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

    // Try JSON response
    try {
        const parsed = JSON.parse(content);

        if (typeof parsed === 'string') {
            content = parsed;
        } else if (parsed && typeof parsed === 'object') {
            const possibleCode =
                parsed.code ??
                parsed.starterCode ??
                parsed.boilerplate ??
                parsed.content;

            if (typeof possibleCode === 'string') {
                content = possibleCode.trim();
            }
        }
    } catch {
        // Response is plain source code.
    }

    content = content
        .replace(/^```[\w+#.-]*\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

    if (!looksLikeStarterCode(content)) {
        throw new Error(
            `BOILERPLATE_INVALID_RESPONSE: ${canonicalKey}`
        );
    }

    return content;
};

/**
 * Generates starter code using OpenRouter.
 */
const generateViaOpenRouter = async (
    userId: string,
    canonicalKey: string,
    question: { question: string; description?: string }
): Promise<string> => {
    if (!OPENROUTER_MODEL) {
        throw new Error('OPENROUTER_MODEL_NOT_CONFIGURED');
    }

    const keyRecord =
        await getUserOpenRouterKeyService.getUserOpenRouterKeyService(
            userId
        );

    const apiKey =
        typeof keyRecord?.openrouterKey === 'string'
            ? keyRecord.openrouterKey.trim()
            : '';

    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY_NOT_FOUND');
    }

    if (/[\r\n]/.test(apiKey)) {
        throw new Error('OPENROUTER_API_KEY_INVALID_FORMAT');
    }

    const languageConfig = LANGUAGE_REGISTRY[canonicalKey];

    const languageName =
        languageConfig?.displayName ||
        canonicalKey;

    const prompt = `
Generate starter/boilerplate code for the following programming problem.

Programming Language:
${languageName}

Problem:
${question.question}

Description:
${question.description || ''}

Requirements:
- Return ONLY executable source code.
- Do NOT return markdown.
- Do NOT return explanations.
- Do NOT return JSON.
- Do NOT include "User Safety" or moderation text.
- Do NOT solve the complete problem.
- Provide only the boilerplate needed for the employee to start solving it.
- Use the correct syntax for ${languageName}.
- Include the required imports/includes.
- Include the main entry point when the language normally requires one.
- Structure the code so the employee can implement the solution.
`;

    try {
        const response = await axios.post(
            OPENROUTER_CHAT_COMPLETIONS_URL,
            {
                model: OPENROUTER_MODEL,
                messages: [
                    {
                        role: 'system',
                        content:
                            'You generate programming starter code. Return only source code.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0,
                max_tokens: OPENROUTER_BOILERPLATE_MAX_TOKENS,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: OPENROUTER_BOILERPLATE_TIMEOUT_MS,
            }
        );

        const content =
            response.data?.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error('BOILERPLATE_EMPTY_RESPONSE');
        }

        return extractBoilerplateCode(
            content,
            canonicalKey
        );
    } catch (error: any) {
        if (error?.response?.data) {
            console.error(
                'OpenRouter boilerplate generation failed:',
                error.response.data
            );
        }

        throw error;
    }
};

/**
 * Adds or updates starter code for a language.
 */
const upsertStarterCode = async (
    taskId: string,
    questionId: string,
    languageId: string,
    code: string
): Promise<void> => {
    const taskObjectId = new Types.ObjectId(taskId);
    const questionObjectId = new Types.ObjectId(questionId);
    const languageObjectId = new Types.ObjectId(languageId);
    const questionFilter = {
        _id: questionObjectId,
        taskId: taskObjectId,
        status: 'ACTIVE'
    };

    const updatedExisting = await TaskCodingQuestionModel.updateOne(
        {
            ...questionFilter,
            'starterCode.languageId': languageObjectId
        },
        {
            $set: {
                'starterCode.$.code': code
            }
        }
    );

    if (updatedExisting.matchedCount > 0) {
        return;
    }

    const addedStarter = await TaskCodingQuestionModel.updateOne(
        {
            ...questionFilter,
            'starterCode.languageId': {
                $ne: languageObjectId
            }
        },
        {
            $push: {
                starterCode: {
                    languageId: languageObjectId,
                    code
                }
            }
        }
    );

    if (addedStarter.matchedCount === 0) {
        throw new Error('TASK_OR_QUESTION_NOT_FOUND');
    }
};

/**
 * Gets existing starter code or generates it using OpenRouter.
 */
export const getOrGenerateBoilerplate = async (
    taskId: string,
    questionId: string,
    userId: string,
    canonicalKey: string,
    languageId: string
): Promise<string> => {
    if (
        !Types.ObjectId.isValid(taskId) ||
        !Types.ObjectId.isValid(questionId) ||
        !Types.ObjectId.isValid(languageId)
    ) {
        throw new Error('INVALID_BOILERPLATE_IDENTIFIERS');
    }

    const question = await TaskCodingQuestionModel.findOne({
        _id: new Types.ObjectId(questionId),
        taskId: new Types.ObjectId(taskId),
        status: 'ACTIVE'
    }).lean();

    if (!question) {
        throw new Error('TASK_OR_QUESTION_NOT_FOUND');
    }

    const existingStarterCode =
        question.starterCode?.find(
            (item: any) =>
                String(item.languageId) === languageId
        );

    if (existingStarterCode?.code?.trim()) {
        return existingStarterCode.code;
    }

    /*
     * Prevent duplicate OpenRouter requests when
     * multiple requests arrive at the same time.
     */
    const generationKey =
        `${taskId}:${questionId}:${canonicalKey}`;

    if (inFlightGenerations[generationKey]) {
        return inFlightGenerations[generationKey]!;
    }

    const generationPromise = (async () => {
        const generatedCode =
            await generateViaOpenRouter(
                userId,
                canonicalKey,
                question
            );

        await upsertStarterCode(
            taskId,
            questionId,
            languageId,
            generatedCode
        );

        return generatedCode;
    })();

    inFlightGenerations[generationKey] =
        generationPromise;

    try {
        return await generationPromise;
    } finally {
        delete inFlightGenerations[generationKey];
    }
};

export default {
    getOrGenerateBoilerplate,
    extractBoilerplateCode,
};
