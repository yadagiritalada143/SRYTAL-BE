import ProgrammingLanguages from '../../model/programmingLanguagesModel';

export interface IAddProgrammingLanguageFields {
    canonicalKey?: string;
    wandboxLabel?: string;
    isActive?: boolean;
    isExecutable?: boolean;
    displayOrder?: number;
}

const slugify = (value: string): string =>
    String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const addProgrammingLanguage = async (languageName: string, fields: IAddProgrammingLanguageFields = {}) => {
    try {
        // canonicalKey/wandboxLabel are required by the schema; derive them from
        // the display name when the caller only sends languageName so a bare
        // { languageName: 'X' } request keeps working (legacy client behaviour).
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
