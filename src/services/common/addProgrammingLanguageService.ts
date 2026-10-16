import ProgrammingLanguages from '../../model/programmingLanguagesModel';
import { IAddProgrammingLanguageFields } from '../../interfaces/programminglanguages';

const slugify = (value: string): string =>
    String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const addProgrammingLanguage = async (languageName: string, fields: IAddProgrammingLanguageFields = {}) => {
    try {
        const canonicalKey = (fields.canonicalKey || '').trim() || slugify(languageName);
        const wandboxLabel = (fields.wandboxLabel || '').trim() || String(languageName || '').trim();
        const programmingLanguage = new ProgrammingLanguages({
            languageName: String(languageName || '').trim(),
            canonicalKey,
            wandboxLabel,
            ...fields
        });
        const result = await programmingLanguage.save();
        return result;

    } catch (error: any) {
        console.error(`Error while adding programming language: ${error && error.message ? error.message : error}`);
        throw new Error('An error occurred while adding programming language.');
    }
};

export default { addProgrammingLanguage };
