"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const courseAssignmentModel_1 = __importDefault(require("../../model/courseAssignmentModel"));
const programmingLanguagesModel_1 = __importDefault(require("../../model/programmingLanguagesModel"));
const languageUtils_1 = require("../../util/languageUtils");
const languageExecutionMap_1 = require("../../types/languageExecutionMap");
/**
 * Employee-facing "open a coding question": returns the problem statement, the
 * available languages and the starter code for the requested (or first) language.
 * Scoped by employee so a user can only read questions that belong to one of
 * their assigned courses. The available languages are read from the
 * programming-languages collection so the employee can pick the language at run
 * time; the hardcoded list is only used as a fallback when the collection is empty.
 */
const getCodingQuestion = async (questionId, language, employeeId) => {
    const task = await courseTaskModel_1.default.findById(questionId).lean();
    if (!task) {
        return { success: false, notFound: true };
    }
    if (!task.isCoding) {
        return { success: false, notCodingQuestion: true };
    }
    const parentModule = await coursemoduleModel_1.default.findById(task.moduleId).lean();
    if (!(parentModule === null || parentModule === void 0 ? void 0 : parentModule.courseId)) {
        return { success: false, notFound: true };
    }
    const assignment = await courseAssignmentModel_1.default.findOne({ employeeId, courseId: parentModule.courseId }).lean();
    if (!assignment) {
        return { success: false, notAssigned: true };
    }
    if (language) {
        if (!(0, languageUtils_1.isSupportedLanguage)(language)) {
            return { success: false, invalidLanguage: true };
        }
    }
    const languageDocs = await programmingLanguagesModel_1.default.find({}).select('languageName').lean();
    const collectionLanguages = (languageDocs || [])
        .map((languageDoc) => ((languageDoc === null || languageDoc === void 0 ? void 0 : languageDoc.languageName) || '').trim())
        .filter(Boolean);
    const fallbackLanguages = [...new Set(Object.values(languageExecutionMap_1.LANGUAGE_MAP))]
        .map((language) => language.charAt(0).toUpperCase() + language.slice(1));
    const availableLanguages = collectionLanguages.length > 0 ? collectionLanguages : fallbackLanguages;
    const resolvedLanguage = (0, languageUtils_1.normalizeLanguage)(language) ||
        (0, languageUtils_1.normalizeLanguage)(availableLanguages[0] || '') ||
        availableLanguages[0] ||
        '';
    return {
        success: true,
        question: {
            questionId: String(task._id),
            question: task.question || '',
            allowedLanguages: availableLanguages,
            language: resolvedLanguage,
            starterCode: (0, languageUtils_1.resolveStarterCode)(task, resolvedLanguage)
        }
    };
};
exports.default = { getCodingQuestion };
