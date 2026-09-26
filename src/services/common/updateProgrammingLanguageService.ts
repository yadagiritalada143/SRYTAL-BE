import ProgrammingLanguages from '../../model/programmingLanguagesModel';

const updateProgrammingLanguage = async (id: string, languageName: string) => {
    try {
        const result = await ProgrammingLanguages.updateOne({ _id: id }, { languageName });
        return result;

    } catch (error: any) {
        console.error(`Error while updating programming language: ${error}`);
        throw new Error('An error occurred while updating programming language.');
    }
};

export default { updateProgrammingLanguage };