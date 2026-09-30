import axios from 'axios';
import CourseTaskModel from '../../model/courseTaskModel';
import getUserOpenRouterKeyService from '../useropenrouter/getUserOpenRouterKeyService';
import { resolveStarterCode } from '../../util/languageUtils';
import { toQuestionIdFilter } from '../../util/courseTaskQuestions';
import { ICourseTaskQuestion } from '../../interfaces/courseTask';
import { LANGUAGE_REGISTRY } from '../../types/languageExecutionMap';

const OPENROUTER_CHAT_COMPLETIONS_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_BOILERPLATE_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/auto';
const OPENROUTER_TIMEOUT_MS = 30000;
// The boilerplate is tiny; caps the reserved tokens so accounts with a small
// balance are not rejected with a 402 "needs more credits" error.
const OPENROUTER_MAX_TOKENS = 800;

const inFlightGenerations: Record<string, Promise<string> | undefined> = {};

// A task holds many questions and each one needs its own skeleton, so the key is
// the question as well as the language.
const generationKey = (taskId: string, questionId: string, canonicalKey: string) =>
    `${taskId}:${questionId || 'default'}:${canonicalKey}`;


const REASONING_PROSE_RE =
    /\b(we? need|the prompt|the problem|let me|but |however|could (also|be)|probably|likely|might|may|should |would |sound like|require|Requisit|here is|below is|the answer)\b/i;

const STARTER_SIGNATURE_RE =
    /\b(function|def|class|public|private|package|sub|defun|defmodule|fn|func|proc|program|module|import|include|using|namespace|export|static|final|async|await)\b|#include|#import|^#!|\b(select|echo|print)\s*\(|void main|int main|main\s*\(|__name__|System\.out|Console\.|puts\(|printf\(/;

const looksLikeStarterCode = (code: string): boolean => {
    const trimmed = (code || '').trim();
    if (!trimmed) {
        return false;
    }
    const lines = trimmed.split('\n');
    if (lines.length > 30 || trimmed.length > 2000) {
        return false;
    }
    if (REASONING_PROSE_RE.test(trimmed)) {
        return false;
    }
    return STARTER_SIGNATURE_RE.test(trimmed);
};

const extractBoilerplateCode = (content: string): string => {
    let raw = (content || '').trim();

    const fenced = raw.match(/```(?:[a-zA-Z0-9_+-]+)?\s*([\s\S]*?)```/i);
    if (fenced && fenced[1]) {
        raw = fenced[1].trim();
    }

    try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
            if (typeof parsed.code === 'string' && parsed.code.trim()) {
                return parsed.code.trim();
            }
            if (typeof parsed.boilerplate === 'string' && parsed.boilerplate.trim()) {
                return parsed.boilerplate.trim();
            }
        }
    } catch (error) {
        // Not JSON - the model returned the code as plain text.
    }

    return raw;
};

const generateViaOpenRouter = async (
    task: any,
    question: ICourseTaskQuestion,
    canonicalKey: string,
    userId: string
): Promise<string> => {
    const keyRecord = await getUserOpenRouterKeyService.getUserOpenRouterKeyService(userId);
    const openRouterKey = keyRecord?.openrouterKey;

    if (!openRouterKey) {
        throw new Error('OPENROUTER_KEY_NOT_FOUND');
    }

    const displayLanguage =
        LANGUAGE_REGISTRY[canonicalKey]?.displayName || canonicalKey;

    // deepseek-v4.1-flash (what openrouter/auto resolves to here) sometimes returns
// an empty body with its reasoning in the `reasoning` field. Retry a few times.
const OPENROUTER_MAX_ATTEMPTS = 3;
const OPENROUTER_RETRY_DELAY_MS = 400;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const prompt = `You generate a LeetCode-style starter skeleton (boilerplate) for a coding problem.

Problem: ${task.taskName || ''}
${question.question || ''}
${question.description || ''}
Language: ${displayLanguage}


Return ONLY the starter code. Requirements:
- Output the language's standard skeleton entry point, not just a bare signature: C needs the usual #include lines plus int main(void) { ... }, Python needs the class Solution + method, Java/C#/C++ need the class with a public static main, JavaScript/TypeScript need function or class + method.
- Correct function or class+method signature derived from the problem, with language-idiomatic type hints (JSDoc @param/@return for JavaScript/TypeScript, :type/:rtype docstring for Python, etc).
- Empty body - only whitespace. Do not implement any logic.
- No extra comments, no explanation, no reasoning, no markdown code fences - output the code only.`;

    for (let attempt = 1; attempt <= OPENROUTER_MAX_ATTEMPTS; attempt++) {
        let response: any;
        try {
            response = await axios.post(
                OPENROUTER_CHAT_COMPLETIONS_URL,
                {
                    model: OPENROUTER_BOILERPLATE_MODEL,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0,
                    max_tokens: OPENROUTER_MAX_TOKENS
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
            const status = error.response?.status;
            if (status === 401 || status === 403) {
                throw new Error('OPENROUTER_KEY_INVALID');
            }
            if (error.code === 'ECONNABORTED' || String(error.message).includes('timeout')) {
                throw new Error('OPENROUTER_BOILERPLATE_TIMEOUT');
            }
            console.error(`OpenRouter boilerplate generation error: ${error.message}`);
            throw new Error('BOILERPLATE_GENERATION_FAILED');
        }

        const content = response.data?.choices?.[0]?.message?.content;

        if (content) {
            const code = extractBoilerplateCode(content);
            if (code && looksLikeStarterCode(code)) {
                return code;
            }
        }

        if (attempt < OPENROUTER_MAX_ATTEMPTS) {
            await wait(OPENROUTER_RETRY_DELAY_MS * attempt);
        }
    }

    throw new Error('BOILERPLATE_EMPTY_RESPONSE');
};

const upsertStarterCode = async (
    task: any,
    question: ICourseTaskQuestion,
    canonicalKey: string,
    code: string
): Promise<void> => {
    const questionId = toQuestionIdFilter(question.questionId);

    // LEGACY (one release): a task authored before questions[] has no subdocument
    // to attach to, so the cache stays on the top-level field. The backfill moves
    // it into questions[0].starterCode, after which this branch is unreachable.
    if (!questionId) {
        await CourseTaskModel.updateOne(
            { _id: task._id },
            { $pull: { starterCode: { languageName: canonicalKey } } }
        );
        await CourseTaskModel.updateOne(
            { _id: task._id },
            { $push: { starterCode: { languageName: canonicalKey, code } } }
        );
        return;
    }

    const arrayFilters = [{ 'questions.questionId': questionId }];

    await CourseTaskModel.updateOne(
        { _id: task._id },
        { $pull: { questions: { $elemMatch: { 'starterCode.languageName': canonicalKey } } } },
        { arrayFilters }
    );
    await CourseTaskModel.updateOne(
        { _id: task._id },
        { $push: { questions: { $each: [{ languageName: canonicalKey, code }] } } },
        { arrayFilters }
    );
};

/**
 * Resolves the LeetCode-style starter skeleton for one question of a coding task
 * in one language. Writer-supplied starters (and previously AI-generated ones
 * cached in the same question's array) win immediately; otherwise the skeleton is
 * generated via OpenRouter from that question's text and cached against it, so
 * the next request - for any employee - has it instantly. Any failure returns ''
 * so the caller shows an empty editor without an error. Concurrent requests for
 * the same question + language share a single in-flight generation.
 */
const getOrGenerateBoilerplate = async (
    task: any,
    question: ICourseTaskQuestion,
    canonicalKey: string,
    userId: string
): Promise<string> => {
    const cached = resolveStarterCode(question, canonicalKey);
    if (cached) {
        return cached;
    }

    const key = generationKey(String(task._id), String(question.questionId || ''), canonicalKey);
    if (inFlightGenerations[key]) {
        return inFlightGenerations[key];
    }

    const generation = (async () => {
        try {
            const code = await generateViaOpenRouter(task, question, canonicalKey, userId);
            if (!code || !looksLikeStarterCode(code)) {
                return '';
            }
            await upsertStarterCode(task, question, canonicalKey, code);
            return code;
        } catch (error: any) {
            console.error(`Boilerplate generation failed for '${canonicalKey}': ${error.message}`);
            return '';
        } finally {
            delete inFlightGenerations[key];
        }
    })();

    inFlightGenerations[key] = generation;
    return generation;
};

export default { getOrGenerateBoilerplate, extractBoilerplateCode };
