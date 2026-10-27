"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFallbackLanguages = exports.getExecutableCanonicalKeys = exports.getWandboxLabel = exports.isExecutableLanguage = exports.normalizeLanguage = void 0;
const languageExecutionMap_1 = require("../types/languageExecutionMap");
const normalizeLanguage = (language) => languageExecutionMap_1.LANGUAGE_MAP[(language || '').trim().toLowerCase()];
exports.normalizeLanguage = normalizeLanguage;
const isExecutableLanguage = (language) => {
    var _a;
    const canonical = (0, exports.normalizeLanguage)(language);
    return Boolean(canonical && ((_a = languageExecutionMap_1.LANGUAGE_REGISTRY[canonical]) === null || _a === void 0 ? void 0 : _a.isExecutable));
};
exports.isExecutableLanguage = isExecutableLanguage;
const getWandboxLabel = (canonicalKey) => { var _a; return (canonicalKey && ((_a = languageExecutionMap_1.LANGUAGE_REGISTRY[canonicalKey]) === null || _a === void 0 ? void 0 : _a.wandboxLabel)) || ''; };
exports.getWandboxLabel = getWandboxLabel;
/**
 * Canonical keys that are marked executable, i.e. the languages Wandbox
 * actually runs. Used for the picker fallback when the collection is empty.
 */
const getExecutableCanonicalKeys = () => Object.keys(languageExecutionMap_1.LANGUAGE_REGISTRY).filter((key) => languageExecutionMap_1.LANGUAGE_REGISTRY[key].isExecutable);
exports.getExecutableCanonicalKeys = getExecutableCanonicalKeys;
const getFallbackLanguages = () => (0, exports.getExecutableCanonicalKeys)().map((key) => languageExecutionMap_1.LANGUAGE_REGISTRY[key].displayName);
exports.getFallbackLanguages = getFallbackLanguages;
