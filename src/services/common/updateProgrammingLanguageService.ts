import ProgrammingLanguages from '../../model/programmingLanguagesModel';

export interface IUpdateProgrammingLanguageFields {
    languageName?: string;
    canonicalKey?: string;
    wandboxLabel?: string;
    isActive?: boolean;
    isExecutable?: boolean;
    displayOrder?: number;
}
const updateProgrammingLanguage = async (
    id: string,
    languageName: string,
    fields: IUpdateProgrammingLanguageFields = {}
) => {
    try {
        const updates: IUpdateProgrammingLanguageFields = {
            ...(languageName ? { languageName } : {}),
            ...fields
        };

        return await ProgrammingLanguages.updateOne(
            { _id: id },
            { $set: updates }
        );
    } catch (error: unknown) {
        console.error(
            'Error while updating programming language:',
            error
        );
        throw new Error(
            'An error occurred while updating programming language.'
        );
    }
};

export default { updateProgrammingLanguage };
