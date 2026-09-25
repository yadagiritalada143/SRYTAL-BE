"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const getUserOpenRouterKeyService_1 = __importDefault(require("../useropenrouter/getUserOpenRouterKeyService"));
const OPENROUTER_CHAT_COMPLETIONS_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_QUALITY_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/auto';
const OPENROUTER_TIMEOUT_MS = 30000;
const toNumber = (value) => {
    const num = Number(value);
    if (Number.isNaN(num)) {
        return 0;
    }
    return Math.max(0, Math.min(100, Math.round(num)));
};
const toStringList = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item)).filter((item) => item.trim() !== '');
    }
    if (typeof value === 'string' && value.trim() !== '') {
        return value.split('\n').map((item) => item.trim()).filter((item) => item !== '');
    }
    return [];
};
const toRating = (value) => {
    const text = String(value !== null && value !== void 0 ? value : '').trim().toLowerCase();
    return text || 'not assessed';
};
/**
 * Tolerant parser for the OpenRouter code-quality JSON. Fills in sensible
 * defaults for missing fields so a single malformed field never fails the run.
 * Throws INVALID_AI_EVALUATION when the content carries no usable analysis.
 */
const extractEvaluation = (content) => {
    var _a;
    let parsed = null;
    let raw = (content || '').trim();
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced && fenced[1]) {
        raw = fenced[1].trim();
    }
    try {
        parsed = JSON.parse(raw);
    }
    catch (error) {
        const start = raw.indexOf('{');
        const end = raw.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
            try {
                parsed = JSON.parse(raw.slice(start, end + 1));
            }
            catch (e) {
                parsed = null;
            }
        }
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        console.error(`Could not parse AI evaluation. Raw content: ${raw.slice(0, 2000)}`);
        throw new Error('INVALID_AI_EVALUATION');
    }
    const standards = parsed.codingStandards || parsed.coding_standards || parsed.standards || {};
    return {
        score: toNumber(parsed.score),
        suggestions: toStringList(parsed.suggestions || parsed.suggestion),
        failedTests: toStringList(parsed.failedTests || parsed.failed_test_cases || []),
        codingStandards: {
            readability: toRating(standards.readability),
            efficiency: toRating(standards.efficiency),
            errorHandling: toRating(standards.errorHandling || standards.error_handling),
            namingConventions: toRating(standards.namingConventions || standards.naming_conventions)
        },
        explanation: String((_a = parsed.explanation) !== null && _a !== void 0 ? _a : '').trim()
    };
};
/**
 * Reusable code-quality analyzer. Sends the coding question, the employee's
 * submitted code and the per-test-case execution results to OpenRouter (using
 * the authenticated employee's saved OpenRouter key) and returns an
 * informational evaluation. The AI verdict never overrides the actual Piston
 * pass/fail results: the passed flags reported by Run Code always come from
 * the backend test-case evaluation.
 */
const analyzeCodeQuality = async ({ userId, question, language, code, results }) => {
    var _a, _b, _c, _d;
    const keyRecord = await getUserOpenRouterKeyService_1.default.getUserOpenRouterKeyService(userId);
    const openRouterKey = keyRecord === null || keyRecord === void 0 ? void 0 : keyRecord.openrouterKey;
    if (!openRouterKey) {
        throw new Error('OPENROUTER_KEY_NOT_FOUND');
    }
    const resultsSummary = results
        .map((result) => `- ${result.name}: ${result.passed ? 'PASSED' : 'FAILED'} | status: ${result.status}` +
        (result.errorDetails ? ` | error: ${result.errorDetails}` : ''))
        .join('\n');
    const prompt = `You are a code-quality reviewer for programming submissions. The pass/fail outcomes you are given reflect real execution results and must NOT be changed. Review only readability, efficiency, error handling and naming conventions.

Question:
${question}

Selected programming language: ${language}

Employee's code:
\`\`\`
${code}
\`\`\`

Execution results (authoritative, do not change):
${resultsSummary}

Return a valid JSON object with this exact structure (no markdown, no code fences):
{
  "score": 80,
  "suggestions": ["Improve error handling for invalid input."],
  "failedTests": ["Negative numbers test"],
  "codingStandards": {
    "readability": "good",
    "efficiency": "fair",
    "errorHandling": "fair",
    "namingConventions": "good"
  },
  "explanation": "The code passed most of the test cases but failed one edge case."
}

Rules:
- score: integer from 0 to 100 rating the code quality.
- failedTests: names of the test cases that failed (from the execution results above).
- codingStandards values: one of good, fair, poor.
- explanation: brief summary of the code's strengths and weaknesses.`;
    const response = await axios_1.default.post(OPENROUTER_CHAT_COMPLETIONS_URL, {
        model: OPENROUTER_QUALITY_MODEL,
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
    const content = (_d = (_c = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content;
    if (!content) {
        throw new Error('INVALID_AI_EVALUATION');
    }
    return extractEvaluation(content);
};
exports.default = { analyzeCodeQuality };
