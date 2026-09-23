import { LANGUAGE_MAP, DEFAULT_STARTER_CODE } from '../types/languageExecutionMap';

/**
 * Maps a user-supplied language (e.g. 'JS', 'Node', 'Python3', 'C++') to the
 * canonical runtime name understood by the execution API. Returns undefined
 * when the language is not supported for execution.
 */
export const normalizeLanguage = (language: string): string | undefined =>
    LANGUAGE_MAP[(language || '').trim().toLowerCase()];

/**
 * Whether the given language is part of the task's allowedLanguages list.
 * Comparison is case-insensitive and also accepts aliases ('cpp' -> 'C++').
 */
export const isLanguageAllowed = (allowedLanguages: string[] | undefined, language: string): boolean => {
    const expected = normalizeLanguage(language) || (language || '').trim().toLowerCase();
    return (allowedLanguages || []).some(
        (allowed) => allowed.trim().toLowerCase() === expected
    );
};

/**
 * Resolves the starter code shown for a language: a content-writer supplied
 * starter wins, otherwise the built-in default template for that language is
 * used. Returns '' when neither exists.
 */
export const resolveStarterCode = (task: any, language: string): string => {
    const normalized = normalizeLanguage(language) || '';
    const writerStarter = ((task && task.starterCode) || []).find(
        (item: any) =>
            item &&
            typeof item.languageName === 'string' &&
            (LANGUAGE_MAP[item.languageName.trim().toLowerCase()] || item.languageName.trim().toLowerCase()) === normalized
    );
    return (writerStarter && writerStarter.code) || DEFAULT_STARTER_CODE[normalized] || '';
};