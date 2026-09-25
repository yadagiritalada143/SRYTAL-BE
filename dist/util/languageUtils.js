"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveStarterCode = exports.isSupportedLanguage = exports.normalizeLanguage = void 0;
const languageExecutionMap_1 = require("../types/languageExecutionMap");
/**
 * Maps a user-supplied language (e.g. 'JS', 'Node', 'Python3', 'C++') to the
 * canonical runtime name understood by the execution API. Returns undefined
 * when the language is not supported for execution.
 */
const normalizeLanguage = (language) => languageExecutionMap_1.LANGUAGE_MAP[(language || '').trim().toLowerCase()];
exports.normalizeLanguage = normalizeLanguage;
/**
 * Whether the given language is a supported execution language. The employee
 * picks the language at run time, so any supported language is allowed.
 * Comparison is case-insensitive and also accepts aliases ('cpp' -> 'C++').
 */
const isSupportedLanguage = (language) => Boolean((0, exports.normalizeLanguage)(language));
exports.isSupportedLanguage = isSupportedLanguage;
/**
 * Resolves the starter code shown for a language: a content-writer supplied
 * starter wins, otherwise the built-in default template for that language is
 * used. Returns '' when neither exists.
 */
const resolveStarterCode = (task, language) => {
    const normalized = (0, exports.normalizeLanguage)(language) || '';
    const writerStarter = ((task && task.starterCode) || []).find((item) => item &&
        typeof item.languageName === 'string' &&
        (languageExecutionMap_1.LANGUAGE_MAP[item.languageName.trim().toLowerCase()] || item.languageName.trim().toLowerCase()) === normalized);
    return (writerStarter && writerStarter.code) || languageExecutionMap_1.DEFAULT_STARTER_CODE[normalized] || '';
};
exports.resolveStarterCode = resolveStarterCode;
