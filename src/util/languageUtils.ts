import { LANGUAGE_MAP, LANGUAGE_REGISTRY } from '../types/languageExecutionMap';

/**
 * Maps a user-supplied language (e.g. 'JS', 'Node', 'Python3', 'C++') to the
 * canonical runtime key understood by the execution pipeline. Returns undefined
 * when the language is not supported for execution.
 */
export const normalizeLanguage = (language: string): string | undefined =>
    LANGUAGE_MAP[(language || '').trim().toLowerCase()];

/**
 * Whether the given language is a recognized execution language (alias or
 * canonical key). The employee picks the language at run time, so any
 * recognized language is allowed.
 */
export const isSupportedLanguage = (language: string): boolean =>
    Boolean(normalizeLanguage(language));

/**
 * Any language WHOSE Wandbox label survives; fallback for when the
 * programming-languages collection has no entry for a canonical key.
 */
export const isExecutableLanguage = (language: string): boolean => {
    const canonical = normalizeLanguage(language);
    return Boolean(canonical && LANGUAGE_REGISTRY[canonical]?.isExecutable);
};

/**
 * Exact `language` value in Wandbox's list.json for a canonical key, used to
 * resolve the newest compiler at request time. Returns '' for unknown keys.
 */
export const getWandboxLabel = (canonicalKey: string): string =>
    (canonicalKey && LANGUAGE_REGISTRY[canonicalKey]?.wandboxLabel) || '';

/**
 * Canonical keys that are marked executable, i.e. the languages Wandbox
 * actually runs. Used for the picker fallback when the collection is empty.
 */
export const getExecutableCanonicalKeys = (): string[] =>
    Object.keys(LANGUAGE_REGISTRY).filter((key) => LANGUAGE_REGISTRY[key].isExecutable);

/**
 * Display names of every executable language, in registration order. Surfaces
 * the picker options when the programming-languages collection is empty.
 */
export const getFallbackLanguages = (): string[] =>
    getExecutableCanonicalKeys().map((key) => LANGUAGE_REGISTRY[key].displayName);

/**
 * Resolves the starter code shown for a language: only a content-writer
 * supplied starter is used here. Anything else (including Wandbox's own
 * hello-world background) is handled by the caller via getWandboxStarter.
 * Returns '' when no writer starter exists.
 */
export const resolveStarterCode = (task: any, language: string): string => {
    const normalized = normalizeLanguage(language) || '';
    const writerStarter = ((task && task.starterCode) || []).find(
        (item: any) =>
            item &&
            typeof item.languageName === 'string' &&
            (LANGUAGE_MAP[item.languageName.trim().toLowerCase()] || item.languageName.trim().toLowerCase()) === normalized
    );
    return (writerStarter && writerStarter.code) || '';
};