import { LANGUAGE_MAP, LANGUAGE_REGISTRY } from '../types/languageExecutionMap';

export const normalizeLanguage = (language: string): string | undefined =>
    LANGUAGE_MAP[(language || '').trim().toLowerCase()];

export const isExecutableLanguage = (language: string): boolean => {
    const canonical = normalizeLanguage(language);
    return Boolean(canonical && LANGUAGE_REGISTRY[canonical]?.isExecutable);
};

export const getWandboxLabel = (canonicalKey: string): string =>
    (canonicalKey && LANGUAGE_REGISTRY[canonicalKey]?.wandboxLabel) || '';

/**
 * Canonical keys that are marked executable, i.e. the languages Wandbox
 * actually runs. Used for the picker fallback when the collection is empty.
 */
export const getExecutableCanonicalKeys = (): string[] =>
    Object.keys(LANGUAGE_REGISTRY).filter((key) => LANGUAGE_REGISTRY[key].isExecutable);

export const getFallbackLanguages = (): string[] =>
    getExecutableCanonicalKeys().map((key) => LANGUAGE_REGISTRY[key].displayName);
