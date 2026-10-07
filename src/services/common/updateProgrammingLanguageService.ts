import ProgrammingLanguages from '../../model/programmingLanguagesModel';
import { IAddProgrammingLanguageFields } from './addProgrammingLanguageService';

export interface IUpdateProgrammingLanguageFields extends IAddProgrammingLanguageFields {
    languageName?: string;
}

const updateProgrammingLanguage = async (id: string, languageName: string, fields: IUpdateProgrammingLanguageFields = {}) => {
    try {
        const updates: IUpdateProgrammingLanguageFields = {
            ...(languageName ? { languageName } : {}),
            ...fields
        };
        const result = await ProgrammingLanguages.updateOne({ _id: id }, { $set: updates });
        return result;

    } catch (error: any) {
        console.error(`Error while updating programming language: ${error}`);
        throw new Error('An error occurred while updating programming language.');
    }
};

export default { updateProgrammingLanguage };