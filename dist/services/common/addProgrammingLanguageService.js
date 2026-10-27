"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const programmingLanguagesModel_1 = __importDefault(require("../../model/programmingLanguagesModel"));
const slugify = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
const addProgrammingLanguage = async (languageName, fields = {}) => {
    try {
        // canonicalKey/wandboxLabel are required by the schema; derive them from
        // the display name when the caller only sends languageName so a bare
        // { languageName: 'X' } request keeps working (legacy client behaviour).
        const canonicalKey = (fields.canonicalKey || '').trim() || slugify(languageName);
        const wandboxLabel = (fields.wandboxLabel || '').trim() || String(languageName || '').trim();
        const programmingLanguage = new programmingLanguagesModel_1.default(Object.assign({ languageName: String(languageName || '').trim(), canonicalKey,
            wandboxLabel }, fields));
        const result = await programmingLanguage.save();
        return result;
    }
    catch (error) {
        console.error(`Error while adding programming language: ${error && error.message ? error.message : error}`);
        throw new Error('An error occurred while adding programming language.');
    }
};
exports.default = { addProgrammingLanguage };
